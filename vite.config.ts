import path from "node:path";
import { defineConfig } from "vite";
import glsl from "vite-plugin-glsl";
import restart from "vite-plugin-restart";

export default defineConfig(() => {
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
    plugins: [glsl(), restart({ restart: ["../static/**"] })].filter(Boolean)
  };
});
