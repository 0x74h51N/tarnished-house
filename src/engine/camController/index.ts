import { createCamera } from "./camera";
import { createClamp, createFPSController } from "./controller";
import { createFreeController } from "./controller/freeController";
import type { CamController, CameraSystemOptions } from "./types";

export function CameraController({
  scene,
  canvas,
  sizes
}: CameraSystemOptions): CamController {
  const { camera, cameraHelper } = createCamera({ sizes });
  scene.add(camera);

  const FreeController = createFreeController({ camera, canvas });
  const FPSController = createFPSController({ camera, canvas });
  const { clampCameraPosition } = createClamp({ camera });

  return {
    camera,
    cameraHelper,
    FreeController,
    FPSController,
    clampCameraPosition
  };
}

export { default as camCnfg } from "./camController.json";
export * from "./controller";
export * from "./types";
