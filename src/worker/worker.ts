import * as Comlink from 'comlink';
import * as wasm from '../../rs/pkg/rs_bg.wasm';
import * as rs from "../../rs/pkg/rs_bg";


export type ExportType = typeof obj

export interface RenderedElement {
  indent: number,
  str: string
}

let isInitialized = false;

const obj = {


  /*Noop when already initialized*/
  initialize: function () {
    if (isInitialized) return;
    rs.__wbg_set_wasm(wasm);
    wasm.__wbindgen_start();
    isInitialized = true;
  },
  useParser: rs.use_parser,
  getRendered: function (): RenderedElement[] {
    return JSON.parse(rs.get_rendered())
  },
  toggle: rs.toggle,
  render: rs.render
};

Comlink.expose(obj);
self.postMessage("READY")