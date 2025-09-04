import {
  type Camera,
  CanvasTexture,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  type Vector3Like
} from "three";
import type { RayCast } from "../interaction";
import { drawRectangle } from "./drawRectangle";

type BtnOpts = {
  onClick: () => void;
  label: string;
  width: number;
  height: number;
  rotation: Vector3Like;
  fontFamily?: string;
};

export async function createBtn({
  btnOpts,
  ray,
  camera,
  canvas
}: {
  btnOpts: BtnOpts;
  ray: RayCast;
  camera: Camera;
  canvas: HTMLCanvasElement;
}) {
  const {
    onClick,
    label,
    width,
    height,
    rotation,
    fontFamily = "UnifrakturCook"
  } = btnOpts;

  const W = 512,
    H = 128;
  const btnColor = "#ffd700";
  const btnBg = "rgba(12,12,16,0.72)";
  const btnRadius = 16;

  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const ctx = cv.getContext("2d");

  const tex = new CanvasTexture(cv);
  const mat = new MeshBasicMaterial({
    map: tex,
    transparent: true,
    depthWrite: false
  });

  const button = new Mesh(new PlaneGeometry(width, height), mat);
  button.rotation.set(rotation.x, rotation.y, rotation.z);
  button.renderOrder = 10;

  let currentLabel = label;

  const refresh = () => {
    if (!ctx) return;
    drawRectangle({
      ctx,
      W,
      H,
      label: currentLabel,
      fontFamily,
      tex,
      color: btnColor,
      bg: btnBg,
      radius: btnRadius
    });
  };

  refresh();

  (document as Document).fonts?.ready?.then(() => refresh()).catch(() => {});

  const setLabel = (s: string) => {
    if (s === currentLabel) return;
    currentLabel = s;
    button.name = `${s}Button`;
    refresh();
  };
  let hovered = false;

  const isLocked = () => document.pointerLockElement === canvas;

  const applyHoverVisual = (isHover: boolean) => {
    if (isHover !== hovered) {
      hovered = isHover;
      const s = hovered ? 1.1 : 1.0;
      button.scale.set(s, 1, s);
      mat.needsUpdate = true;
      if (!isLocked()) canvas.style.cursor = hovered ? "pointer" : "";
    }
  };

  const onMove = (pointerEvent: PointerEvent) => {
    if (isLocked() && pointerEvent.pointerType !== "touch") return;
    ray.setNdcFromEvent({ pointerEvent, canvas });
    applyHoverVisual(ray.hitTest({ camera, target: button }));
  };

  const onDown = (pointerEvent: PointerEvent) => {
    if (pointerEvent.pointerType === "touch") {
      ray.setNdcFromEvent({ pointerEvent, canvas });
      if (ray.hitTest({ camera, target: button })) onClick?.();
      return;
    }
    if (isLocked()) {
      if (ray.hitTest({ camera, target: button })) onClick?.();
    } else {
      ray.setNdcFromEvent({ pointerEvent, canvas });
      if (ray.hitTest({ camera, target: button })) onClick?.();
    }
  };

  const onPlc = () => {
    if (isLocked()) {
      applyHoverVisual(ray.hitTest({ camera, target: button }));
    } else {
      canvas.style.cursor = hovered ? "pointer" : "";
    }
  };

  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerdown", onDown);
  document.addEventListener("pointerlockchange", onPlc);

  const update = () => {
    if (isLocked()) {
      applyHoverVisual(ray.hitTest({ camera, target: button }));
    }
  };

  const dispose = () => {
    canvas.removeEventListener("pointermove", onMove);
    canvas.removeEventListener("pointerdown", onDown);
    document.removeEventListener("pointerlockchange", onPlc);
    tex.dispose();
    mat.dispose();
    button.geometry.dispose?.();
  };

  return { button, dispose, setLabel, update };
}
