import { defineConfig } from "vite";
import restart from "vite-plugin-restart";
import checker from "vite-plugin-checker";
import { visualizer } from "rollup-plugin-visualizer";
import glsl from "vite-plugin-glsl";
import path from "path";

export default defineConfig(() => {
  const shouldAnalyze = process.env.ANALYZE === "1";
  return {
    root: "src/",
    publicDir: "../static/",
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
        components: path.resolve(__dirname, "src/components"),
        "config.json": path.resolve(__dirname, "./config.json"),
      },
    },
    server: {
      host: true,
      open: !(
        "SANDBOX_URL" in process.env || "CODESANDBOX_HOST" in process.env
      ),
    },
    build: {
      outDir: "../dist",
      emptyOutDir: true,
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            three: ["three"],
            stats: ["stats.js"],
          },
        },
      },
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
          brotliSize: true,
        }),
    ].filter(Boolean),
  };
});
