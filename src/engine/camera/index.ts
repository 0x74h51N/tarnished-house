import { createCamera } from "./camera";
import { createClamp } from "./clamp";
import { setupControls } from "./control";
import { CameraSystemOptions, CameraSystemReturn } from "./types";

export function createCameraSystem({
  scene,
  canvas,
  sizes,
}: CameraSystemOptions): CameraSystemReturn {
  return (({ camera, cameraHelper }) => {
    scene.add(camera);
    return {
      camera,
      cameraHelper,
      ...setupControls({ camera, canvas }),
      ...createClamp({ camera }),
    };
  })(createCamera({ sizes }));
}
