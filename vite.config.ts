import path from "node:path";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";
import checker from "vite-plugin-checker";
import glsl from "vite-plugin-glsl";
import restart from "vite-plugin-restart";

export default defineConfig(() => {
  const shouldAnalyze = process.env.ANALYZE === "1";
  return {
    root: "src/",
    publicDir: "../static/",
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
        components: path.resolve(__dirname, "src/components"),
        "config.json": path.resolve(__dirname, "src/config.json"),
        "assets.json": path.resolve(__dirname, "src/assets.json")
      },
      dedupe: ["@three.ez/instanced-mesh"]
    },
    server: {
      host: true,
      open: !("SANDBOX_URL" in process.env || "CODESANDBOX_HOST" in process.env)
    },
    build: {
      outDir: "../dist",
      emptyOutDir: true,
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            three: ["three"]
          }
        }
      }
    },
    plugins: [
      glsl(),
      restart({ restart: ["../static/**"] }),
      checker({ typescript: true }),
      shouldAnalyze &&
        visualizer({
          open: true,
          filename: "stats.html",
          gzipSize: true,
          brotliSize: true
        })
    ].filter(Boolean)
  };
});
