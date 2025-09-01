import type { Page } from "@playwright/test";

export async function renderReady(page: Page, timeout = 5000) {
  await page.waitForFunction(
    () => {
      const w = window as unknown as {
        __RENDERER__?: { info?: { render?: { triangles?: number } } };
      };
      const r = w.__RENDERER__;
      if (!r || !r.info || !r.info.render) return false;
      const tris = r.info.render.triangles ?? 0;
      return typeof tris === "number" && tris > 0;
    },
    undefined,
    { timeout, polling: "raf" }
  );
}
