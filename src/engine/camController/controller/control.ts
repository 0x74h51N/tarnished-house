const IS_DEV: boolean = import.meta.env.DEV;

import config from "config.json";
import { Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { byId } from "@/components";
import { createJoystick } from "./joystick";
import type { ControlOptions, ControlReturn } from "./types";
import { angDelta, expLerp } from "./utils";

export function setupControls({
  camera,
  canvas
}: ControlOptions): ControlReturn {
  const {
    maxPolarAngle,
    minPolarAngle,
    mouseSens,
    moveTau,
    dead,
    mobileLook,
    lookTau,
    moveSpeed,
    sprintMult
  } = config.scene.camera.controls;
  const sprint = sprintMult * (IS_DEV ? 2 : 1);
  const controls = new OrbitControls(camera, canvas);
  controls.enabled = false;

  const loadingScreen = byId("loading-screen");
  const isActive = () =>
    !!loadingScreen && loadingScreen.classList.contains("hidden");

  const minPitch = Math.PI / 2 - (maxPolarAngle ?? Math.PI);
  const maxPitch = Math.PI / 2 - (minPolarAngle ?? 0);

  camera.rotation.order = "YXZ";

  const dir0 = new Vector3();
  camera.getWorldDirection(dir0);

  let yaw = Math.atan2(-dir0.x, -dir0.z);

  let pitch = Math.max(minPitch, Math.min(maxPitch, Math.asin(dir0.y)));
  let tYaw = yaw,
    tPitch = pitch;

  if ("ontouchstart" in window || navigator.maxTouchPoints > 0) {
    tPitch = pitch = Math.min(maxPitch, Math.max(minPitch, 0));
  }

  const isLocked = () => isActive() && document.pointerLockElement === canvas;

  let locked = false;

  const onPLC = () => {
    locked = isLocked();
    canvas.style.cursor = locked ? "none" : "";
  };

  const onCanvasClick = () => {
    if (!isTouch && !isLocked() && isActive()) {
      canvas.requestPointerLock();
    }
  };

  const onEsc = (e: KeyboardEvent) => {
    if (e.code === "Escape" && document.pointerLockElement === canvas) {
      document.exitPointerLock();
    }
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isLocked()) return;
    tYaw -= e.movementX * mouseSens;
    tPitch -= e.movementY * mouseSens;
    if (tPitch > maxPitch) tPitch = maxPitch;
    if (tPitch < minPitch) tPitch = minPitch;
  };

  const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

  canvas.addEventListener("click", onCanvasClick);
  document.addEventListener("pointerlockchange", onPLC);
  document.addEventListener("mousemove", onMouseMove);
  window.addEventListener("keydown", onEsc);

  const joy = isTouch
    ? createJoystick({
        size: 120,
        position: { left: "70px", bottom: "80px" }
      })
    : null;

  const camJoy = isTouch
    ? createJoystick({
        size: 120,
        position: { right: "70px", bottom: "80px" }
      })
    : null;

  const pressed = new Set<string>();
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
  let sx = 0,
    sz = 0;
  let lxs = 0,
    lys = 0;

  const controller = (dt: number) => {
    // --- input
    let mx = 0,
      mz = 0;
    if (joy) {
      const v = joy.get();
      mx += v.x;
      mz += v.y;
    }
    if (pressed.has("KeyW") || pressed.has("ArrowUp")) mz += 1;
    if (pressed.has("KeyS") || pressed.has("ArrowDown")) mz -= 1;
    if (pressed.has("KeyA") || pressed.has("ArrowLeft")) mx -= 1;
    if (pressed.has("KeyD") || pressed.has("ArrowRight")) mx += 1;

    // normalize + deadzone
    const len = Math.hypot(mx, mz);
    if (len > 1) {
      mx /= len;
      mz /= len;
    }
    if (len < dead) {
      mx = 0;
      mz = 0;
    }

    // smoothing

    sx = expLerp(sx, mx, moveTau, dt);
    sz = expLerp(sz, mz, moveTau, dt);

    if (isTouch && camJoy) {
      const { lookDead, turnTau } = mobileLook;
      const lv = camJoy.get();

      lxs = expLerp(lxs, lv.x, turnTau, dt);
      lys = expLerp(lys, lv.y, turnTau, dt);

      const mag = Math.hypot(lxs, lys);
      if (mag > lookDead) {
        const expo = 1.6;
        const norm = (mag - lookDead) / (1 - lookDead);
        const gain = Math.min(1, Math.max(0, norm)) ** expo;

        const lookRateMax = Math.PI;
        const lookRate = lookRateMax * gain;

        tYaw -= lxs * lookRate * dt;
        tPitch += lys * lookRate * dt;

        if (tPitch > maxPitch) tPitch = maxPitch;
        if (tPitch < minPitch) tPitch = minPitch;
      }
    }

    const aLook = 1 - Math.exp(-dt / lookTau);
    yaw += angDelta(yaw, tYaw) * aLook;
    pitch = expLerp(pitch, tPitch, lookTau, dt);

    camera.rotation.set(pitch, yaw, 0, "YXZ");

    const fwdX = -Math.sin(yaw),
      fwdZ = -Math.cos(yaw);
    const rightX = Math.cos(yaw),
      rightZ = -Math.sin(yaw);

    const base = moveSpeed;
    const spd =
      (pressed.has("ShiftLeft") || pressed.has("ShiftRight")
        ? base * sprint
        : base) * dt;

    if (Math.hypot(sx, sz) > 1e-3) {
      const dx = sz * fwdX + sx * rightX;
      const dz = sz * fwdZ + sx * rightZ;
      camera.position.x += dx * spd;
      camera.position.z += dz * spd;
    }
  };

  return { controls, controller };
}
