import { Vector3 } from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { byId } from "@/components";
import { IS_DEV } from "@/main";
import { camCnfg } from "../";
import { type InputProvider, KeyboardInput } from "../input";
import type { ControlOptions, FreeController } from "./types";

export function createFreeController({
  camera,
  canvas
}: ControlOptions): FreeController {
  const { moveSpeed } = camCnfg.controls;

  const controls = new OrbitControls(camera, canvas);
  controls.enabled = IS_DEV || false;

  const loadingScreen = byId("loading-screen");
  const isActive = () =>
    !!loadingScreen && loadingScreen.classList.contains("hidden");

  camera.rotation.order = "YXZ";
  const dir0 = new Vector3();

  camera.getWorldDirection(dir0);

  const input: InputProvider = new KeyboardInput(
    canvas,
    () => camCnfg.controls.mouseSens,
    () => isActive()
  );

  const up = new Vector3(0, 1, 0),
    fwd = new Vector3(),
    right = new Vector3(),
    tmp = new Vector3();

  const controller = (dt: number) => {
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

  return { controls, controller };
}
