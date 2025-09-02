import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests",
  webServer: {
    command:
      "rm -rf node_modules/.vite dist .tsbuildinfo && VITE_E2E=1 npm run build && VITE_E2E=1 npm run preview",
    port: 4173,
    reuseExistingServer: !process.env.CI
  },
  use: {
    browserName: "chromium",
    headless: true,
    baseURL: "http://localhost:4173",
    launchOptions: {
      args: [
        "--use-angle=swiftshader",
        "--enable-unsafe-swiftshader",
        "--ignore-gpu-blocklist",
        "--disable-gpu-sandbox"
      ]
    }
  },
  timeout: 10_000
});
