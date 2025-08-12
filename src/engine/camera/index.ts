import { createCamera } from "./camera";
import { createCamPositioner } from "./cameraPositioner";
import { createClamp } from "./clamp";
import { setupControls } from "./control";
import { CameraSystemOptions, CamController } from "./types";

export function CameraController({
  scene,
  canvas,
  sizes,
}: CameraSystemOptions): CamController {
  const { camera, cameraHelper } = createCamera({ sizes });
  scene.add(camera);

  const { controls } = setupControls({ camera, canvas });
  const { clampCameraPosition } = createClamp({ camera });
  const positioner = createCamPositioner({ camera, controls });

  return {
    camera,
    cameraHelper,
    controls,
    clampCameraPosition,
    positioner,
  };
}

export * from "./types";
