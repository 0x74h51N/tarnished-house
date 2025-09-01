/** biome-ignore-all lint/style/noNonNullAssertion: Test */
import { expect, test } from "@playwright/test";
import { renderReady } from "./helpers";

test("WebGL canvas&context test", async ({ page }) => {
  await page.goto("/?e2e");

  const hasCanvas = await page.locator("canvas.webgl").count();
  expect(hasCanvas).toBeGreaterThan(0);

  const ok = await page.evaluate(() => {
    const c = document.querySelector(
      "canvas.webgl"
    ) as HTMLCanvasElement | null;
    if (!c) return false;
    const gl =
      (c.getContext("webgl2") as WebGL2RenderingContext | null) ||
      (c.getContext("webgl") as WebGLRenderingContext | null);
    if (!gl) return false;
    const maxTex = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number;
    const maxVTex = gl.getParameter(
      gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS
    ) as number;
    return maxTex > 0 && maxVTex >= 0;
  });
  expect(ok).toBeTruthy();
});

test("Renderer first render", async ({ page }) => {
  await page.goto("/?e2e");
  await renderReady(page);

  const tris = await page.evaluate(() => {
    const w = window as {
      __RENDERER__?: { info?: { render?: { triangles?: number } } };
    };
    return w.__RENDERER__?.info?.render?.triangles;
  });
  expect(tris).toBeGreaterThan(0);
});

test("Static object render control [Bonfire]", async ({ page }) => {
  await page.goto("/?e2e");

  await page.waitForFunction(
    () => {
      type Obj = { name?: string };
      type SceneLike = { traverse(cb: (o: Obj) => void): void };
      const w = window as { __SCENE__?: SceneLike };
      const s = w.__SCENE__;
      if (!s) return false;
      let found = false;
      s.traverse((o) => {
        if (
          !found &&
          typeof o.name === "string" &&
          o.name.startsWith("bonfire_")
        ) {
          found = true;
        }
      });
      return found;
    },
    undefined,
    { timeout: 4000, polling: "raf" }
  );
  type Obj = {
    name?: string;
    visible?: boolean;
    isMesh?: boolean;
    isPoints?: boolean;
    traverse?: (cb: (o: Obj) => void) => void;
  };
  type SceneLike = { traverse(cb: (o: Obj) => void): void };

  type BonfireDetail = {
    name: string;
    visible: boolean;
    meshCount: number;
    pointsAttached: number;
  };

  const detail = await page.evaluate<BonfireDetail | null>(() => {
    const w = window as unknown as { __SCENE__?: SceneLike };
    const scene = w.__SCENE__;
    if (!scene) return null;

    let root: Obj | null = null;
    scene.traverse((o: Obj) => {
      if (
        !root &&
        typeof o.name === "string" &&
        o.name.startsWith("bonfire_")
      ) {
        root = o;
      }
    });
    if (!root) return null;

    const r: Obj = root;
    let meshCount = 0;
    let pointsAttached = 0;

    if (typeof r.traverse === "function") {
      r.traverse((n: Obj) => {
        if (n.isMesh) meshCount++;
        if (n.isPoints) pointsAttached++;
      });
    }

    return {
      name: String(r.name ?? ""),
      visible: !!r.visible,
      meshCount,
      pointsAttached
    };
  });

  expect(detail).not.toBeNull();
  const d = detail;
  expect(d!.name.startsWith("bonfire_")).toBeTruthy();
  expect(d!.visible).toBeTruthy();
  expect(d!.meshCount).toBeGreaterThan(0);
});

test.beforeEach(async ({ page }, testInfo) => {
  page.on("pageerror", (err) =>
    testInfo.attach("pageerror", {
      body: String(err),
      contentType: "text/plain"
    })
  );
  page.on("console", (msg) => {
    if (["error", "warning"].includes(msg.type())) {
      testInfo.attach(`console:${msg.type()}`, {
        body: msg.text(),
        contentType: "text/plain"
      });
    }
  });
});
