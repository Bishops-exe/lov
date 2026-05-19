import {useState, useRef, useCallback} from "react";

export default function useDragDrop(fn: (e: DragEvent) => void) {
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const dragCounter = useRef<number>(0);

  const ref = useCallback((node: HTMLElement | null) => {
    if (!node) return;

    const onDragEnter = (e: DragEvent) => {
      e.preventDefault();
      dragCounter.current++;
      setIsDragOver(true);
    };
    const onDragOver = (e: DragEvent) => {
      e.preventDefault();
    };
    const onDragLeave = () => {
      dragCounter.current--;
      if (dragCounter.current === 0) setIsDragOver(false);
    };
    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      dragCounter.current = 0;
      setIsDragOver(false);
      fn(e)
    };

    node.addEventListener("dragenter", onDragEnter);
    node.addEventListener("dragover", onDragOver);
    node.addEventListener("dragleave", onDragLeave);
    node.addEventListener("drop", onDrop);

    return () => {
      node.removeEventListener("dragenter", onDragEnter);
      node.removeEventListener("dragover", onDragOver);
      node.removeEventListener("dragleave", onDragLeave);
      node.removeEventListener("drop", onDrop);
    };
  }, [fn]);

  return { isDragOver, ref };
}
