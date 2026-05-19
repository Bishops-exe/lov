mod parsers;
mod utils;
mod viewer;

use crate::parsers::{use_csv, use_json, use_json5, use_toml, use_yaml};
use crate::viewer::Viewer;
use std::cell::RefCell;
use std::sync::atomic::{AtomicU32, Ordering};
use wasm_bindgen::prelude::*;

static RENDER_GEN: AtomicU32 = AtomicU32::new(0);

thread_local! {
    static VIEWER: RefCell<Option<Viewer>> = RefCell::new(None);
}

#[cfg(feature = "dev")]
#[wasm_bindgen(start)]
pub fn main() {
    console_error_panic_hook::set_once();
}

fn set_viewer(value: Viewer) {
    VIEWER.with(|d| *d.borrow_mut() = Some(value));
}

#[wasm_bindgen]
pub fn get_rendered() -> Result<JsValue, JsValue> {
    VIEWER.with(|d| {
        Ok(JsValue::from_str(&*map_err!(serde_json::to_string(
            &d.borrow().as_ref().unwrap().rendered
        ))?))
    })
}

#[wasm_bindgen]
pub fn cancel_render() {
    RENDER_GEN.fetch_add(1, Ordering::SeqCst);
}

#[wasm_bindgen]
pub fn render() -> bool {
    let my_gen = RENDER_GEN.fetch_add(1, Ordering::SeqCst) + 1;
    VIEWER.with(|d| match d.borrow_mut().as_mut() {
        Some(v) => v.render_cancellable(|| RENDER_GEN.load(Ordering::SeqCst) != my_gen),
        None => unreachable!(),
    })
}

#[wasm_bindgen]
pub fn toggle(row_index: u32) {
    VIEWER.with(|d| {
        if let Some(v) = d.borrow_mut().as_mut() {
            v.toggle(row_index as usize);
        }
    });
}

#[wasm_bindgen]
#[derive(Copy, Clone)]
pub enum Parser {
    Json,
    Json5,
    Yaml,
    Toml,
    CSV,
}

#[wasm_bindgen]
pub fn use_parser(parser: Parser, data: &[u8]) -> Result<(), JsValue> {
    match parser {
        Parser::Yaml => use_yaml(data),
        Parser::Toml => use_toml(data),
        Parser::Json => use_json(data),
        Parser::Json5 => use_json5(data),
        Parser::CSV => use_csv(data),
    }
}
