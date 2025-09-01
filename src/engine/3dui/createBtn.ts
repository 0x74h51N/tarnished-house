import {
  type Camera,
  CanvasTexture,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  Raycaster,
  Vector2,
  type Vector3Like
} from "three";
import { roundRect } from "./utils";

type BtnOpts = {
  camera: Camera;
  canvas: HTMLCanvasElement;
  onClick: () => void;
  label: string;
  width: number;
  height: number;
  rotation: Vector3Like;
  fontFamily?: string;
};

export async function createBtn({
  camera,
  canvas,
  onClick,
  label,
  width,
  height,
  rotation,
  fontFamily = "UnifrakturCook"
}: BtnOpts) {
  const W = 512,
    H = 128;
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

  const draw = ctx
    ? () => {
        const gold = "#ffd700";
        ctx.clearRect(0, 0, W, H);

        ctx.fillStyle = "rgba(12,12,16,0.72)";
        roundRect(ctx, 12, 12, W - 24, H - 24, 16, true, false);

        ctx.strokeStyle = gold;
        ctx.lineWidth = 6;
        roundRect(ctx, 12, 12, W - 24, H - 24, 16, false, true);

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = "#000";
        ctx.shadowBlur = 8;
        ctx.fillStyle = gold;
        ctx.strokeStyle = "#2a1a00";
        ctx.lineWidth = 2;

        ctx.font = `72px "${fontFamily}", serif`;
        ctx.fillText(currentLabel, W * 0.5, H * 0.52);
        ctx.strokeText(currentLabel, W * 0.5, H * 0.52);

        tex.needsUpdate = true;
      }
    : () => {};

  draw();
  (document as Document).fonts?.ready?.then(() => draw()).catch(() => {});

  const setLabel = (s: string) => {
    if (s === currentLabel) return;
    currentLabel = s;
    button.name = `${s}Button`;
    draw();
  };

  button.name = `${label}Button`;
  button.rotation.set(rotation.x, rotation.y, rotation.z);
  button.renderOrder = 10;

  const ray = new Raycaster();
  const ndc = new Vector2();
  let hovered = false;

  const toNDC = (ev: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    ndc.x = ((ev.clientX - r.left) / r.width) * 2 - 1;
    ndc.y = -((ev.clientY - r.top) / r.height) * 2 + 1;
  };

  const hitTest = () => {
    ray.setFromCamera(ndc, camera);
    return ray.intersectObject(button, true).length > 0;
  };

  const onMove = (ev: PointerEvent) => {
    toNDC(ev);
    const h = hitTest();
    if (h !== hovered) {
      hovered = h;
      const s = hovered ? 1.1 : 1.0;
      button.scale.set(s, 1, s);
      mat.needsUpdate = true;
      canvas.style.cursor = hovered ? "pointer" : "";
    }
  };

  const onDown = (ev: PointerEvent) => {
    toNDC(ev);
    if (hitTest()) {
      onClick?.();
    }
  };

  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerdown", onDown);

  const dispose = () => {
    canvas.removeEventListener("pointermove", onMove);
    canvas.removeEventListener("pointerdown", onDown);
    tex.dispose();
    mat.dispose();
    button.geometry.dispose?.();
  };

  return { button, dispose, setLabel };
}
