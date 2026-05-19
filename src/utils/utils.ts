let form: HTMLFormElement;
let input: HTMLInputElement;

export function pickFile(accept: string) {
  return new Promise<File | undefined>((resolve) => {
    if (!form) {
      form = document.createElement("form");
      form.className = "hidden"
      form.setAttribute("aria-hidden", "true");
      document.body.appendChild(form);
    }
    if (!input) {
      input = document.createElement("input");
      input.type = "file";
      input.name = "object";
      form.appendChild(input);
    }
    input.accept = accept;


    function onChange(this: HTMLInputElement) {
      this.removeEventListener("change", onChange);
      resolve(this?.files?.[0])
    }

    input.addEventListener("change", onChange);

    input.click();
  });
}

import * as comlink from "comlink"
import type {Remote} from "comlink"
import Worker from "../worker/worker.ts?worker"
import type {ExportType as WorkerType} from "../worker/worker.ts"

let wasm: Remote<WorkerType> | undefined;

export function getWasm(): Promise<Remote<WorkerType>> {
  if (wasm === undefined) {
    const worker = new Worker();
    return new Promise((resolve) => {
      function handle(ev: MessageEvent) {
        if (ev.data !== "READY") return;
        wasm = comlink.wrap<WorkerType>(worker)
        resolve(wasm)


        worker.removeEventListener("message", handle);
      }

      worker.addEventListener("message", handle);
    })
  }
  return Promise.resolve(wasm)
}