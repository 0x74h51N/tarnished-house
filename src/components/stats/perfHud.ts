import { WebGLRenderer } from "three";
import StatsGL from "stats-gl";
import "./style.css";
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
  wrap.className = "perf-hud";

  const holder = document.createElement("div");
  holder.className = "perf-hud-stats";
  wrap.appendChild(holder);

  const text = document.createElement("div");
  text.className = "perf-hud-text";
  wrap.appendChild(text);

  let mounted = false;
  const prev = { calls: 0, triangles: 0, points: 0 };

  const stats = new StatsGL({ trackGPU: true, minimal: false });
  stats.init(renderer);

  function mount() {
    if (mounted) return;
    holder.appendChild(stats.dom);
    container.appendChild(wrap);
    mounted = true;
    const r = renderer.info.render;
    prev.calls = r.calls;
    prev.triangles = r.triangles;
    prev.points = r.points;
  }

  function unmount() {
    if (!mounted) return;
    wrap.remove();
    mounted = false;
  }

  function getJsHeapMB(): string {
    const mem = (performance as Performance & {memory?: { usedJSHeapSize: number };
                }).memory;
    if (mem && mem.usedJSHeapSize) {
      return (mem.usedJSHeapSize / 1048576).toFixed(1) + " MB";
    }
    return "n/a";
  }

  function updateOverlay() {
    if (!mounted) return;

    const r = renderer.info.render;

    const frameCalls = r.calls - prev.calls;
    const frameTris = (r.triangles - prev.triangles);
    const framePoints = r.points - prev.points;

    prev.calls = r.calls;
    prev.triangles = r.triangles;
    prev.points = r.points;

    const heap = getJsHeapMB();
    const geos = renderer.info.memory.geometries;
    const texs = renderer.info.memory.textures;

    text.innerHTML =
      fmt("Draw Calls", frameCalls) +
      fmt("Triangles", frameTris, true) +
      fmt("Points", framePoints) +
      fmt("Geometries", geos) +
      fmt("Textures", texs) +
      fmt("Heap (JS)", heap);

    stats.update();
  }

  function toggleStats(show: boolean) {
    if (show) mount();
    else unmount();
  }

  return { updateOverlay, toggleStats };
}
