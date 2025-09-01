const IS_DEV: boolean = import.meta.env.DEV;

import config from "config.json";
import { Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/Addons";
import type { ControlOptions, ControlReturn } from "./types";

export function setupControls({
  camera,
  canvas
}: ControlOptions): ControlReturn {
  const controls = new OrbitControls(camera, canvas);
  const cfg = config.scene.camera.controls;

  controls.enableDamping = true;
  controls.dampingFactor = cfg.dampingFactor;
  controls.screenSpacePanning = true;
  controls.enablePan = true;
  controls.panSpeed = cfg.panSpeed;
  controls.rotateSpeed = cfg.rotateSpeed;
  controls.minDistance = cfg.minDistance;
  controls.maxDistance = cfg.maxDistance;
  controls.minPolarAngle = cfg.minPolarAngle;
  controls.maxPolarAngle = cfg.maxPolarAngle;

  if (IS_DEV) {
    controls.minDistance = 0.01;
    controls.maxDistance = Number.POSITIVE_INFINITY;
    controls.minPolarAngle = 0;
    controls.maxPolarAngle = Math.PI;
    controls.enablePan = true;
    controls.enableRotate = true;
    controls.enableZoom = true;
  }

  const pressed = new Set<string>();
  const up = new Vector3(0, 1, 0);
  const fwd = new Vector3();
  const right = new Vector3();

  const onKeyDown = (e: KeyboardEvent) => {
    const t = e.target as HTMLElement | null;
    if (
      t &&
      (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)
    )
      return;
    pressed.add(e.code);
  };
  const onKeyUp = (e: KeyboardEvent) => {
    pressed.delete(e.code);
  };

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);

  const devUpdate = (dt: number) => {
    if (pressed.size === 0) return;

    camera.getWorldDirection(fwd);
    fwd.y = 0;
    fwd.normalize();
    right.copy(fwd).cross(up).normalize();

    let mx = 0,
      mz = 0;
    if (pressed.has("KeyW")) mz += 1;
    if (pressed.has("KeyS")) mz -= 1;
    if (pressed.has("KeyA")) mx -= 1;
    if (pressed.has("KeyD")) mx += 1;

    if (mx === 0 && mz === 0) return;

    const base = 8;
    const spd =
      ((pressed.has("ShiftLeft") || pressed.has("ShiftRight")) && IS_DEV
        ? base * 5
        : base) * dt;
    const move = fwd
      .multiplyScalar(mz * spd)
      .add(right.multiplyScalar(mx * spd));

    camera.position.add(move);
    controls.target.add(move);
  };
  return { controls, devUpdate };
}
