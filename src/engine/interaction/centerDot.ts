import { Raycaster, Vector2 } from "three";
import type {
  CenterDot,
  RayCast,
  RayHitTestParams,
  RayNdcFromEvent
} from "./types";
import "./styles.css";

export function createCenterDot(canvas: HTMLCanvasElement): CenterDot {
  const el = document.createElement("div");
  el.className = "center-dot";
  document.body.appendChild(el);

  const show = () => el.classList.add("show");
  const hide = () => el.classList.remove("show");

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
      canvas.style.cursor = "none";
      ndc.set(0, 0);
      show();
    } else {
      canvas.style.cursor = "";
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
