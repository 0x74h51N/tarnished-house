import StatsGL from "stats-gl";
import type { WebGLRenderer } from "three";
import "./style.css";
import { IS_DEV } from "@/main";
import { fmt } from "./utils";

export type PerfHUD = {
  updateOverlay: () => void;
  toggleStats: (show: boolean) => void;
};

type Options = {
  renderer: WebGLRenderer;
  container: HTMLElement;
};
export function createPerfHUD(opts: Options): PerfHUD {
  const { renderer, container } = opts;

  renderer.info.autoReset = false;
  const wrap = document.createElement("div");

  const holder = document.createElement("div");
  wrap.appendChild(holder);

  let textDiv: HTMLDivElement | null = null;
  if (IS_DEV) {
    wrap.className = "perf-hud";

    holder.className = "perf-hud-stats";
    textDiv = document.createElement("div");
    textDiv.className = "perf-hud-text";
    wrap.appendChild(textDiv);
  }

  let mounted = false;
  const prev = { calls: 0, triangles: 0, points: 0 };

  const stats = new StatsGL({ trackGPU: IS_DEV, minimal: !IS_DEV });
  stats.init(renderer);

  function mount() {
    if (mounted) return;
    holder.appendChild(stats.dom);
    container.appendChild(wrap);
    mounted = true;

    if (IS_DEV) {
      const r = renderer.info.render;
      prev.calls = r.calls;
      prev.triangles = r.triangles;
      prev.points = r.points;
    }
  }

  function unmount() {
    if (!mounted) return;
    wrap.remove();
    mounted = false;
  }

  function getJsHeapMB(): string {
    const mem = (
      performance as Performance & { memory?: { usedJSHeapSize: number } }
    ).memory;
    if (mem?.usedJSHeapSize)
      return `${(mem.usedJSHeapSize / 1048576).toFixed(1)} MB`;
    return "n/a";
  }

  function updateOverlay() {
    if (!mounted) return;

    if (IS_DEV && textDiv) {
      const r = renderer.info.render;

      const frameCalls = r.calls - prev.calls;
      const frameTris = r.triangles - prev.triangles;
      const framePoints = r.points - prev.points;

      prev.calls = r.calls;
      prev.triangles = r.triangles;
      prev.points = r.points;

      const heap = getJsHeapMB();
      const geos = renderer.info.memory.geometries;
      const texs = renderer.info.memory.textures;

      textDiv.innerHTML =
        fmt("Draw Calls", frameCalls) +
        fmt("Triangles", frameTris, true) +
        fmt("Points", framePoints) +
        fmt("Geometries", geos) +
        fmt("Textures", texs) +
        fmt("Heap (JS)", heap);
    }
    stats.update();
  }

  function toggleStats(show: boolean) {
    if (show) mount();
    else unmount();
  }

  return { updateOverlay, toggleStats };
}
