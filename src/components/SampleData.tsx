import {Copy} from "lucide-react";
import {useEffect, useRef, useState} from "react";

export default function SampleData({name, url}: { name: string, url: string }) {
  const [isCopied, setIsCopied] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  })

  async function copy() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setIsCopied(true);

    timerRef.current = setTimeout(() => {
      setIsCopied(false);
    }, 2000);

    await navigator.clipboard.writeText(url);
  }

  return <div
      className="h-full w-full flex flex-row items-center justify-between rounded-lg border-(--color-base-300) border-2 p-2 gap-2 shadow-xl">
    <span className="m-0 font-bold">{name}</span>
    <button onClick={copy} className="btn btn-circle p-2 shadow-md btn-primary tooltip"
            data-tip={isCopied ? "Copied!" : "Click to copy URL"} aria-label="Copy URL">
      <Copy stroke="white" width="100%" height="100%" aria-hidden="false"/>
    </button>
  </div>
}