use crate::viewer::Icons;

#[macro_export]
macro_rules! map_err {
    ($x:expr) => {
        $x.map_err(|e| e.to_string())
    };
}

#[macro_export]
macro_rules! as_str {
    ($x:expr) => {
        $x.to_string().as_str()
    };
}

pub fn key_value(key: Option<&str>, value: &str, icon: Icons) -> String {
    let key_string = match key {
        Some(key) => format!("{key}: "),
        None => String::new(),
    };
    format!("{}{}({})", key_string, icon, value)
}
