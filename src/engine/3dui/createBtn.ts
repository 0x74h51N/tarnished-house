import {
  Mesh,
  PlaneGeometry,
  MeshBasicMaterial,
  DoubleSide,
  Raycaster,
  Vector2,
  Camera,
  CanvasTexture,
  Vector3Like,
} from "three";

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
  fontFamily = "UnifrakturCook",
}: BtnOpts) {
  const W = 512,
    H = 128;
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const ctx = cv.getContext("2d")!;

  const draw = () => {
    const gold = "#ffd700";
    ctx.clearRect(0, 0, W, H);

    ctx.fillStyle = "rgba(12, 12, 16, 0.72)";
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
    ctx.fillText(label, W * 0.5, H * 0.52);
    ctx.strokeText(label, W * 0.5, H * 0.52);

    tex.needsUpdate = true;
  };

  if (await (document as Document).fonts.ready) {
    (document as Document).fonts.ready.then(draw).catch(draw);
  } else {
    draw();
  }

  const tex = new CanvasTexture(cv);
  const mat = new MeshBasicMaterial({
    map: tex,
    transparent: true,
    depthWrite: false,
    side: DoubleSide,
  });

  const button = new Mesh(new PlaneGeometry(width, height), mat);
  button.name = label + "Button";
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

  return { button, dispose };
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill: boolean,
  stroke: boolean
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}
