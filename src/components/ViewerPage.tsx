import {useVirtualizer} from "@tanstack/react-virtual";
import React, {useEffect, useRef, useState} from "react";
import {getWasm} from "../utils/utils.ts";
import type {RenderedElement} from "../worker/worker.ts";

export const ROW_HEIGHT = 44;

export default function ViewerPage() {
  const [data, setData] = useState<RenderedElement[]>()

  async function renderAndSet() {
    const render = await (await getWasm()).render()
    if (!render) return

    const rendered = await (await getWasm()).getRendered()
    setData(rendered)
  }

  useEffect(() => {
    renderAndSet()
  }, [])

  const parentRef = useRef(null);

  const virtualizer = useVirtualizer({
    count: data?.length ?? 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 5,
  });

  if (data === undefined) {
    return <div className="flex h-screen w-full items-center justify-center">
      <span className="loading loading-dots loading-xl"></span>
    </div>
  }

  return (
      <main
          ref={parentRef}
          className="w-full h-screen overflow-auto"
      >
        <div
            className="overflow-auto w-full relative *:absolute *:top-0 *:left-0 *:flex *:flex-col *:justify-center *:p-4 *:whitespace-nowrap *:*:ml-[calc(var(--i)*30px)]"
            style={{
              height: `${virtualizer.getTotalSize()}px`,
            }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const str = data[virtualRow.index]

            return <div
                key={virtualRow.index}
                className=""
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                onClick={async () => {
                  await (await getWasm()).toggle(virtualRow.index)
                  await renderAndSet()
                }}
            >
                <span style={{"--i": str.indent} as React.CSSProperties} children={str.str} />
            </div>

          })}
        </div>
      </main>
  )


}