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

  let mounted = false;

  const stats = new StatsGL({ trackGPU: IS_DEV, minimal: !IS_DEV });
  stats.init(renderer);

  let initPrev: (() => void) | null = null;

  let updateOverlay: () => void;

  function getJsHeapMB(): string {
    const mem = (
      performance as Performance & { memory?: { usedJSHeapSize: number } }
    ).memory;
    return mem?.usedJSHeapSize
      ? `${(mem.usedJSHeapSize / 1048576).toFixed(1)} MB`
      : "n/a";
  }

  if (IS_DEV) {
    wrap.className = "perf-hud";
    holder.className = "perf-hud-stats";
    const textDiv = document.createElement("div");
    textDiv.className = "perf-hud-text";
    wrap.appendChild(textDiv);
    const prev = { calls: 0, triangles: 0, points: 0 };
    initPrev = () => {
      const r = renderer.info.render;
      prev.calls = r.calls;
      prev.triangles = r.triangles;
      prev.points = r.points;
    };

    updateOverlay = () => {
      if (!mounted) return;

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

      stats.update();
    };
  } else {
    updateOverlay = () => {
      if (!mounted) return;
      stats.update();
    };
  }

  function mount() {
    if (mounted) return;
    holder.appendChild(stats.dom);
    container.appendChild(wrap);
    mounted = true;
    if (initPrev) initPrev();
  }

  function unmount() {
    if (!mounted) return;
    wrap.remove();
    mounted = false;
  }

  function toggleStats(show: boolean) {
    if (show) mount();
    else unmount();
  }

  return { updateOverlay, toggleStats };
}
