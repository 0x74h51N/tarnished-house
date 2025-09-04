import type { StaticPosition } from "./types";

export function applyAnchors(
  el: HTMLElement,
  pos: StaticPosition,
  halfPx: number
) {
  (["left", "right", "top", "bottom"] as const).forEach((k) => {
    const v = pos[k];
    if (v != null) el.style[k] = `calc(${v} - ${halfPx}px)`;
  });
}

export const expLerp = (cur: number, target: number, tau: number, dt: number) =>
  cur + (target - cur) * (1 - Math.exp(-dt / tau));

export const angDelta = (a: number, b: number) => {
  let d = b - a;
  d = ((d + Math.PI) % (Math.PI * 2)) - Math.PI;
  return d;
};
