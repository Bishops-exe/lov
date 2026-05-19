import {pickFile as pick} from "../utils/utils.ts";
import {getWasm} from "../utils/utils.ts";
import {useEffect, useState} from "react";
import EnumDropdown from "./EnumDropdown.tsx";
// We use the bg to not initialize the wasm, but still get the value without async
import {Parser} from "../../rs/pkg/rs_bg"
import type {Parser as ParserType} from "../../rs/pkg/rs"
import useDragDrop from "../hooks/useDragDrop.tsx";

enum InputType {
  FILE = "FILE",
  URL = "URL",
}

enum State {
  INITIALIZING = "INITIALIZING",
  WAITING_FOR_INPUT = "WAITING_FOR_INPUT",
  PARSING = "PARSING",
  ERROR = "ERROR",
}

export default function Upload({onBytesReceived: onBytesReceived}: {
  onBytesReceived: () => void
}) {
  const [buttonId] = useState<string>(() => crypto.randomUUID());
  const [url, setUrl] = useState<string>("");
  const [activeParser, setActiveParser] = useState<ParserType>(Parser.Json);
  const [inputType, setInputType] = useState(InputType.FILE);
  const [state, setState] = useState(State.INITIALIZING);

  useEffect(() => {
    (async () => {
      try {
        await (await getWasm()).initialize();
        setState(State.WAITING_FOR_INPUT);
      } catch (e) {
        console.error("WASM init failed", e);
        setState(State.ERROR);
      }
    })()
  }, []);


  const {ref, isDragOver} = useDragDrop(async (event) => {
    const files = event.dataTransfer?.files;

    if (files === undefined || files.length === 0) return;

    const file = files[0]
    const data = new Uint8Array(await file.arrayBuffer())
    await handleBytes(data);
  })

  async function handleBytes(data: Uint8Array) {
    try {
      setState(State.PARSING);
      await (await getWasm()).useParser(activeParser, data)
      onBytesReceived();
    } catch (e) {
      console.error(e)
      setState(State.WAITING_FOR_INPUT);
    }

  }

  async function pickFile() {
    const file = await pick("")
    if (!file) return

    await handleBytes(await file.bytes())
  }


  async function inputLink() {
    const resp = await fetch(url);
    const data = await resp.bytes()

    await handleBytes(data)
  }

  return (
      <div
          className="w-full h-full fieldset rounded-lg border-(--color-base-300) border-2 shadow-xl p-0 flex flex-col gap-0 bg-[repeating-linear-gradient(-45deg,var(--back-color),var(--back-color)12px,var(--stroke-color)12px,var(--stroke-color)14px)] [--stroke-color:var(--color-base-300)] [--back-color:var(--color-base-100)] data-[dragging=true]:[--stroke-color:var(--color-info)] data-[dragging=true]:[--back-color:var(--color-base-100)]"
          data-dragging={isDragOver}
          ref={ref}
      >
        <div className="relative">
          <div className="absolute top-0 left-0">
            <EnumDropdown target={Parser} active={activeParser} setActive={setActiveParser}/>
          </div>
        </div>


        <div className="p-16 w-full h-full flex-1 flex flex-col justify-center items-center">
          {state === State.ERROR
              ? <button className="btn btn-error btn-wide" onClick={() => {
                setState(State.INITIALIZING);
                (async () => {
                  try {
                    await (await getWasm()).initialize()
                    setState(State.WAITING_FOR_INPUT)
                  } catch (e) {
                    console.error("WASM init failed", e);
                    setState(State.ERROR);
                  }
                })()


              }}>Initialization failed - retry</button>
              : inputType === InputType.FILE
                  ? <button className="btn btn-primary btn-wide" onClick={pickFile}
                            disabled={state !== State.WAITING_FOR_INPUT}
                            children={state === State.WAITING_FOR_INPUT ? "Upload File" : "Loading..."}/>
                  : <div className="join">
                    <div>
                      <label className="input validator join-item">
                        <input type="url" placeholder="https://example.com"
                               onChange={(e) => setUrl(e.target.value)}/>
                      </label>
                      <div className="validator-hint hidden">Enter valid URL!</div>
                    </div>
                    <button className="btn btn-primary join-item" onClick={inputLink} id={buttonId}
                            disabled={!URL.canParse(url) || state !== State.WAITING_FOR_INPUT}
                            children={state === State.WAITING_FOR_INPUT ? "Fetch" : "Loading..."}/>
                  </div>
          }
          <p className="mb-0 text-center" aria-hidden={state !== State.WAITING_FOR_INPUT}>
            <i>
              {
                inputType === InputType.FILE
                    ? <>
                      try dropping a file here,
                      <br/>
                      or <a onClick={() => setInputType(InputType.URL)}
                            className="text-inherit link"> inputting a link</a>
                    </>
                    : <>
                      or <a onClick={() => setInputType(InputType.FILE)}
                            className="text-inherit link">using a file</a>
                    </>
              }

            </i>
          </p>
        </div>
      </div>
  )
}