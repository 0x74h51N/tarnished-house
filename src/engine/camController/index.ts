import { createCamera } from "./camera";
import { createClamp, setupControls } from "./controller";
import type { CamController, CameraSystemOptions } from "./types";

export function CameraController({
  scene,
  canvas,
  sizes
}: CameraSystemOptions): CamController {
  const { camera, cameraHelper } = createCamera({ sizes });
  scene.add(camera);

  const { controls, controller } = setupControls({ camera, canvas });
  const { clampCameraPosition } = createClamp({ camera });

  return {
    camera,
    cameraHelper,
    controls,
    controller,
    clampCameraPosition
  };
}

export { default as camCnfg } from "./config.json";
export * from "./controller";
export * from "./types";
