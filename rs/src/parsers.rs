use serde_json::json;
use wasm_bindgen::JsValue;
use crate::{map_err, set_viewer};
use crate::viewer::Viewer;

pub fn use_yaml(data: &[u8]) -> Result<(), JsValue> {
    let yaml_data: serde_json::Value = map_err!(serde_saphyr::from_slice(data))?;
    set_viewer(Viewer::from(yaml_data));
    Ok(())
}

pub fn use_toml(data: &[u8]) -> Result<(), JsValue> {
    let toml_data: toml::Value = map_err!(toml::from_slice(data))?;
    set_viewer(Viewer::from(map_err!(serde_json::to_value(toml_data))?));
    Ok(())
}

pub fn use_json5(data: &[u8]) -> Result<(), JsValue> {
    let s = map_err!(str::from_utf8(data))?;
    let json5_data: serde_json::Value = map_err!(json5::from_str(s))?;
    set_viewer(Viewer::from(json5_data));
    Ok(())
}

pub fn use_json(data: &[u8]) -> Result<(), JsValue> {
    let json_data: serde_json::Value = map_err!(serde_json::from_slice(data))?;
    set_viewer(Viewer::from(json_data));
    Ok(())
}

pub fn use_csv(data: &[u8]) -> Result<(), JsValue> {
    let mut rdr: csv::Reader<&[u8]> = csv::Reader::from_reader(data);
    let rows: Vec<Vec<String>> = map_err!(rdr.deserialize().collect::<Result<_, _>>())?;
    set_viewer(Viewer::from(json!(rows)));
    Ok(())
}