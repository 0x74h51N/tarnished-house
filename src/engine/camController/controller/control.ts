import { type Camera, Vector3 } from "three";
import { byId } from "@/components";
import { camCnfg, type FPSController } from "..";
import { type InputProvider, KeyboardInput, TouchInput } from "../input";
import { angDelta, expLerp } from "../utils/helpers";

export function createFPSController(params: {
  camera: Camera;
  canvas: HTMLCanvasElement;
}): FPSController {
  const { camera, canvas } = params;

  const {
    maxPolarAngle,
    minPolarAngle,
    moveTau,
    mobileLook,
    lookTau,
    moveSpeed,
    sprintMult
  } = camCnfg.controls;

  const loadingScreen = byId("loading-screen");
  const isActive = () =>
    !!loadingScreen && loadingScreen.classList.contains("hidden");

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
  let dx = 0,
    dz = 0;

  const update = (dt: number) => {
    const { moveX, moveY, lookX, lookY, sprint } = input.sample(dt);

    sx = expLerp(sx, moveX, moveTau, dt);
    sz = expLerp(sz, moveY, moveTau, dt);

    tYaw -= lookX;
    tPitch += lookY;
    if (tPitch > maxPitch) tPitch = maxPitch;
    if (tPitch < minPitch) tPitch = minPitch;

    const aLook = 1 - Math.exp(-dt / lookTau);
    yaw += angDelta(yaw, tYaw) * aLook;
    pitch = expLerp(pitch, tPitch, lookTau, dt);

    const fwdX = -Math.sin(yaw),
      fwdZ = -Math.cos(yaw);
    const rightX = Math.cos(yaw),
      rightZ = -Math.sin(yaw);
    const base = moveSpeed;
    const spd = (sprint ? base * sprintMult : base) * dt;

    if (Math.hypot(sx, sz) > 1e-3) {
      dx = (sz * fwdX + sx * rightX) * spd;
      dz = (sz * fwdZ + sx * rightZ) * spd;
    } else {
      dx = 0;
      dz = 0;
    }
  };

  return {
    update,
    get yaw() {
      return yaw;
    },
    get pitch() {
      return pitch;
    },
    get dx() {
      return dx;
    },
    get dz() {
      return dz;
    }
  };
}
