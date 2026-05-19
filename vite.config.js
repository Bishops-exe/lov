import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import wasm from "vite-plugin-wasm";
import path from "node:path";
import * as fs from "node:fs";
import { spawn } from "node:child_process";

/**
 * @param crate {string}
 */
function wasmPack(crate) {
  let root = process.cwd();
  let isDevMode = false; // true when running vite dev server

  function runWasmPack() {
    return new Promise((resolve, reject) => {
      const absOut = path.resolve(root, path.join("rs", "pkg"));
      const extraArgs = isDevMode
        ? ["--dev", "--", "--features", "dev"]
        : ["--release"];

      const args = [
        "build",
        path.resolve(root, crate),
        "--out-dir",
        absOut,
        ...extraArgs,
      ];

      process.stdout.write(
        `\n[vite-plugin-wasm-pack] Running: wasm-pack. ⏳\r`
      );

      const proc = spawn("wasm-pack", args, {
        stdio: "ignore",
      });

      proc.on("error", (err) => {
        if (err.code === "ENOENT") {
          reject(
            new Error(
              `[vite-plugin-wasm-pack] Running: wasm-pack. ❌
                  Do you have it installed? Install it with: \`cargo install wasm-pack\`  or  \`npm i -g wasm-pack\``
            )
          );
        } else {
          reject(err);
        }
      });

      proc.on("close", (code) => {
        if (code === 0) {
          console.log("[vite-plugin-wasm-pack] Running: wasm-pack. ✅\n");
          resolve();
        } else {
          console.log("[vite-plugin-wasm-pack] Running: wasm-pack. ❌\n");
          reject(
            new Error(
              `[vite-plugin-wasm-pack] wasm-pack exited with code ${code}`
            )
          );
        }
      });
    });
  }

  /** Collect .rs source files and Cargo.toml to watch */
  function getWatchTargets() {
    const crateAbs = path.resolve(root, crate);
    const targets = [path.join(crateAbs, "Cargo.toml")];

    const srcDir = path.join(crateAbs, "src");
    if (fs.existsSync(srcDir)) {
      targets.push(srcDir);
    }

    return targets;
  }

  return {
    name: "vite-plugin-wasm-pack",

    // ── Build-time hook ──────────────────────────────────────────────────────
    async buildStart() {
      await runWasmPack();
    },

    // ── Dev-server hook ──────────────────────────────────────────────────────
    configResolved(config) {
      root = config.root;
      isDevMode = config.mode === "development";
    },

    configureServer(server) {
      const watched = getWatchTargets();
      watched.forEach((t) => server.watcher.add(t));

      let debounceTimer = null;

      server.watcher.on("change", (file) => {
        const crateAbs = path.resolve(root, crate);
        if (!file.startsWith(crateAbs)) {
          return;
        }
        if (!file.endsWith(".rs") && !file.endsWith("Cargo.toml")) {
          return;
        }

        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(async () => {
          try {
            await runWasmPack();
            // Trigger a full-reload so the new .wasm is picked up
            server.ws.send({ type: "full-reload" });
          } catch (err) {
            console.error(err.message);
            server.ws.send({
              type: "error",
              err: { message: err.message, stack: err.stack },
            });
          }
        }, 300);
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(() => {
  return {
    plugins: [react(), wasm(), wasmPack("./rs")],
    worker: {
      format: "es",
      plugins: () => [wasm()],
    },
    build: {
      minify: "terser",
      terserOptions: {
        format: {
          beautify: false,
        },
        compress: true,
      },
      rolldownOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("react") || id.includes("react-dom"))
              return "vendor-react";
            if (
              id.includes("lucide-react") ||
              id.includes("@tanstack/react-virtual")
            )
              return "vendor-ui";
          },
        },
      },
    },
    // Don't assume a path, instead use relative paths
    base: "",
  };
});
