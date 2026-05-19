# Lov — **L**arge **o**bject **v**iewer

A fast, browser-based viewer for large structured data files.  
Rust/WASM handles parsing; React virtualizes the tree so only visible rows render.

## Features

- **Formats:** JSON, JSON5, YAML, TOML, CSV
- **Input:** drag-and-drop, file picker, or fetch from a URL
- **Virtualized tree** — renders only what's on screen; handles large files without freezing
- **Collapsible nodes** — click any row to toggle subtrees
- **Dark mode** — persisted in `localStorage`
- **Data samples** — 6 different examples hosted by the [JSON placeholder api](https://jsonplaceholder.typicode.com/)

## Stack

| Tech                                            | Layer               |
|-------------------------------------------------|---------------------|
| React 19, TypeScript, Tailwind CSS 4, DaisyUI 5 | UI                  |
| Rust compiled to WASM (`wasm-bindgen`)          | Parsing / rendering |
| `@tanstack/react-virtual`                       | Virtualization      |
| Vite 8, Bun                                     | Build               |

## Getting started

```bash
# Install dependencies
bun install

# Dev server
bun run dev

# Production build
bun run build
```

> **Requirements:** `wasm-pack` must be installed — Vite compiles the Rust crate automatically on `dev`/`build`.
> ```bash
> cargo install wasm-pack
> # or
> npm i -g wasm-pack
> # or
> bun i -g wasm-pack
> ```

## Project layout

```
src/
  components/   React components (MainPage, ViewerPage, Upload, …)
  hooks/        useDragDrop
  utils/        WASM loader helpers
  worker/       Web Worker + WASM bridge
rs/
  src/          Rust source (parsers, viewer, tree logic)
  pkg/          Pre-built WASM output
```

## Supporting

Lov is free and open source (MIT).  
If it saves you time, consider sponsoring me or starring this repo.

## License

MIT © 2026 Bishops-exe
