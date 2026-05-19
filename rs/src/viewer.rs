use crate::as_str;
use crate::utils::key_value;
use std::collections::HashSet;
use std::fmt::{Display, Formatter};
use std::sync::atomic::{AtomicI32, Ordering};
use std::sync::Arc;

static NEXT_ID: AtomicI32 = AtomicI32::new(0);

fn next_id() -> i32 {
    NEXT_ID.fetch_add(1, Ordering::Relaxed)
}

#[derive(Clone, Debug)]
pub enum CollapsibleArray {
    /// Expandable node: id, display label, children
    Node(i32, Arc<str>, Box<[CollapsibleArray]>),
    /// Leaf value: display string
    Leaf(Arc<str>),
}

#[allow(dead_code)]
#[derive(Clone, Debug)]
pub enum Icons {
    Error,
    Array,
    Boolean,
    Null,
    Number,
    Object,
    String,
}

impl Display for Icons {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            Icons::Error => write!(f, "Error"),
            Icons::Array => write!(f, "Array"),
            Icons::Boolean => write!(f, "Boolean"),
            Icons::Null => write!(f, "Null"),
            Icons::Number => write!(f, "Number"),
            Icons::Object => write!(f, "Object"),
            Icons::String => write!(f, "String"),
        }
    }
}

#[derive(Clone, Debug)]
pub struct RenderedNode {
    pub str: Arc<str>,
    pub indent: u16,
}

impl serde::Serialize for RenderedNode {
    fn serialize<S: serde::Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        use serde::ser::SerializeStruct;
        let mut s = serializer.serialize_struct("RenderedNode", 2)?;
        s.serialize_field("indent", &self.indent)?;
        s.serialize_field("str", self.str.as_ref())?;
        s.end()
    }
}

#[derive(Clone, Debug)]
pub struct Viewer {
    expanded: HashSet<i32>,
    data: CollapsibleArray,
    pub rendered: Box<[RenderedNode]>,
    row_ids: Box<[i32]>,
}

impl Viewer {
    pub fn new(data: CollapsibleArray) -> Viewer {
        let mut v = Viewer {
            expanded: HashSet::new(),
            data,
            rendered: Box::new([]),
            row_ids: Box::new([]),
        };
        v.render();
        v
    }

    pub fn toggle(&mut self, row_index: usize) {
        if let Some(&id) = self.row_ids.get(row_index) {
            if id != -1 && !self.expanded.remove(&id) {
                self.expanded.insert(id);
            }
            self.render();
        }
    }

    pub fn render(&mut self) {
        self.render_cancellable(|| false);
    }

    /// Returns `true` if completed, `false` if canceled.
    pub fn render_cancellable(&mut self, _canceled: impl Fn() -> bool) -> bool {
        let mut out: Vec<RenderedNode> = Vec::new();
        let mut ids: Vec<i32> = Vec::new();
        render_node(&self.data, &self.expanded, 0, &mut out, &mut ids);
        self.rendered = out.into_boxed_slice();
        self.row_ids = ids.into_boxed_slice();
        true
    }
}

fn key_value_arc(key: Option<&str>, value: &str, icon: Icons) -> Arc<str> {
    key_value(key, value, icon).into()
}

fn json_to_collapsible(value: &serde_json::Value, key: Option<&str>) -> CollapsibleArray {
    match value {
        serde_json::Value::Null => CollapsibleArray::Leaf(key_value_arc(key, "", Icons::Null)),
        serde_json::Value::Bool(b) => {
            CollapsibleArray::Leaf(key_value_arc(key, as_str!(b), Icons::Boolean))
        }
        serde_json::Value::Number(n) => {
            CollapsibleArray::Leaf(key_value_arc(key, as_str!(n), Icons::Number))
        }
        serde_json::Value::String(s) => CollapsibleArray::Leaf(key_value_arc(
            key,
            as_str!(format!("\"{s}\"")),
            Icons::String,
        )),
        serde_json::Value::Array(arr) => CollapsibleArray::Node(
            next_id(),
            key_value_arc(
                key,
                format!("{{length: {}}}", arr.len()).as_str(),
                Icons::Array,
            ),
            arr.iter()
                .enumerate()
                .map(|(k, v)| json_to_collapsible(v, Some(k.to_string().as_str())))
                .collect(),
        ),
        serde_json::Value::Object(map) => CollapsibleArray::Node(
            next_id(),
            key_value_arc(
                key,
                format!("{{length: {}}}", map.len()).as_str(),
                Icons::Object,
            ),
            map.iter()
                .map(|(k, v)| json_to_collapsible(v, Some(k)))
                .collect(),
        ),
    }
}

impl From<serde_json::Value> for Viewer {
    fn from(value: serde_json::Value) -> Self {
        Viewer::new(json_to_collapsible(&value, Some("root")))
    }
}

fn render_node(
    node: &CollapsibleArray,
    expanded: &HashSet<i32>,
    depth: usize,
    out: &mut Vec<RenderedNode>,
    ids: &mut Vec<i32>,
) {
    match node {
        CollapsibleArray::Leaf(s) => {
            out.push(RenderedNode {
                str: Arc::clone(s),
                indent: depth as u16,
            });
            ids.push(-1);
        }
        CollapsibleArray::Node(id, label, children) => {
            out.push(RenderedNode {
                str: Arc::clone(label),
                indent: depth as u16,
            });
            ids.push(*id);
            if expanded.contains(id) {
                for child in children {
                    render_node(child, expanded, depth + 1, out, ids);
                }
            }
        }
    }
}
