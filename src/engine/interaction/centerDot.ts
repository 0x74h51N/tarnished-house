import { Raycaster, Vector2 } from "three";
import opts from "./interaction.json";
import type {
  CenterDot,
  RayCast,
  RayHitTestParams,
  RayNdcFromEvent
} from "./types";

export function createCenterDot(canvas: HTMLCanvasElement): CenterDot {
  const { size, color, outline, outlinePx, opacity, zIndex } = opts;

  const el = document.createElement("div");

  Object.assign(el.style, {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: "50%",
    background: color,
    boxShadow: `0 0 0 ${outlinePx}px ${outline}`,
    opacity: opacity,
    pointerEvents: "none",
    zIndex: zIndex,
    display: "none"
  });
  document.body.appendChild(el);

  const show = () => el.style.setProperty("display", "block", "important");
  const hide = () => el.style.setProperty("display", "none", "important");

  const ray = new Raycaster();
  const ndc = new Vector2(0, 0);

  let lockCanvas: HTMLCanvasElement | null = null;
  let centerMode = false;

  const isLockedNow = () => {
    const cur = document.pointerLockElement;
    if (!cur) return false;
    if (!lockCanvas) return true;
    return cur === lockCanvas || lockCanvas.contains(cur);
  };

  const onPlc = () => {
    centerMode = isLockedNow();
    if (centerMode) {
      ndc.set(0, 0);
      show();
    } else {
      hide();
    }
  };
  const setNdcFromEvent = ({ pointerEvent, canvas }: RayNdcFromEvent) => {
    if (centerMode) return;
    const r = canvas.getBoundingClientRect();
    ndc.x = ((pointerEvent.clientX - r.left) / r.width) * 2 - 1;
    ndc.y = -((pointerEvent.clientY - r.top) / r.height) * 2 + 1;
  };

  const hitTest = ({ camera, target, recursive = false }: RayHitTestParams) => {
    if (centerMode) ndc.set(0, 0);
    ray.setFromCamera(ndc, camera);
    return ray.intersectObject(target, recursive).length > 0;
  };

  lockCanvas = canvas;
  document.addEventListener("pointerlockchange", onPlc);
  onPlc();

  const destroy = () => {
    document.removeEventListener("pointerlockchange", onPlc);
    hide();
    el.remove();
    lockCanvas = null;
  };

  const rayCast: RayCast = { setNdcFromEvent, hitTest };
  return { destroy, el, rayCast, show, hide };
}
