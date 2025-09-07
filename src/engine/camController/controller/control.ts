import { Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { byId } from "@/components";
import { IS_DEV } from "@/main";
import { camCnfg } from "../";
import { type InputProvider, KeyboardInput, TouchInput } from "./input";
import type { ControlOptions, ControlReturn } from "./types";
import { angDelta, expLerp } from "./utils";
export function setupControls({
  camera,
  canvas
}: ControlOptions): ControlReturn {
  const {
    maxPolarAngle,
    minPolarAngle,
    moveTau,
    mobileLook,
    lookTau,
    moveSpeed,
    sprintMult
  } = camCnfg.controls;

  const controls = new OrbitControls(camera, canvas);
  controls.enabled = IS_DEV || false;

  const loadingScreen = byId("loading-screen");
  const isActive = () =>
    !!loadingScreen && loadingScreen.classList.contains("hidden");

  // touch screen
  const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

  camera.rotation.order = "YXZ";
  const dir0 = new Vector3();

  camera.getWorldDirection(dir0);

  let yaw = Math.atan2(-dir0.x, -dir0.z);
  const minPitch = Math.PI / 2 - (maxPolarAngle ?? Math.PI);
  const maxPitch = Math.PI / 2 - (minPolarAngle ?? 0);

  let pitch = Math.max(minPitch, Math.min(maxPitch, Math.asin(dir0.y)));
  let tYaw = yaw,
    tPitch = pitch;

  if (isTouch) tPitch = pitch = Math.min(maxPitch, Math.max(minPitch, 0));

  const input: InputProvider = isTouch
    ? new TouchInput(
        mobileLook,
        () => camCnfg.controls.touchSens,
        () => isActive(),
        loadingScreen
      )
    : new KeyboardInput(
        canvas,
        () => camCnfg.controls.mouseSens,
        () => isActive()
      );

  let sx = 0,
    sz = 0;

  let controller: (dt: number) => void;

  if (IS_DEV) {
    const up = new Vector3(0, 1, 0),
      fwd = new Vector3(),
      right = new Vector3(),
      tmp = new Vector3();

    controller = (dt: number) => {
      const { moveX: mx, moveY: mz, sprint } = input.sample(dt);
      controls.update();
      camera.getWorldDirection(fwd).normalize();
      right.copy(fwd).cross(up).normalize();

      const k = (sprint ? 8 : 2) * moveSpeed * dt;
      tmp
        .copy(fwd)
        .multiplyScalar(mz)
        .addScaledVector(right, mx)
        .multiplyScalar(k);
      camera.position.add(tmp);
      controls.target.add(tmp);
    };
  } else {
    controller = (dt: number) => {
      const { moveX, moveY, lookX, lookY, sprint } = input.sample(dt);

      sx = expLerp(sx, moveX, moveTau, dt);
      sz = expLerp(sz, moveY, moveTau, dt);

      // look target
      tYaw -= lookX;
      tPitch += lookY;
      if (tPitch > maxPitch) tPitch = maxPitch;
      if (tPitch < minPitch) tPitch = minPitch;

      // look smoothing
      const aLook = 1 - Math.exp(-dt / lookTau);
      yaw += angDelta(yaw, tYaw) * aLook;
      pitch = expLerp(pitch, tPitch, lookTau, dt);
      camera.rotation.set(pitch, yaw, 0, "YXZ");

      // translate
      const fwdX = -Math.sin(yaw),
        fwdZ = -Math.cos(yaw);
      const rightX = Math.cos(yaw),
        rightZ = -Math.sin(yaw);

      const base = moveSpeed;
      const spd = (sprint ? base * sprintMult : base) * dt;

      if (Math.hypot(sx, sz) > 1e-3) {
        const dx = sz * fwdX + sx * rightX;
        const dz = sz * fwdZ + sx * rightZ;
        camera.position.x += dx * spd;
        camera.position.z += dz * spd;
      }
    };
  }

  return { controls, controller };
}
