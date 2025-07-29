import { CameraHelper, PerspectiveCamera } from "three";
import { CameraOptions, CameraReturn } from "./types";
import config from "config.json";

export function createCamera({ sizes }: CameraOptions): CameraReturn {
  const camera = new PerspectiveCamera(
    config.scene.camera.fov,
    sizes.width / sizes.height,
    config.scene.camera.near,
    config.scene.camera.far
  );
  camera.position.set(
    config.scene.camera.position.x,
    config.scene.camera.position.y,
    config.scene.camera.position.z
  );

  let cameraHelper = null;
  if (config.scene.debug.cameraHelper) {
    cameraHelper = new CameraHelper(camera);
  }

  return { camera, cameraHelper };
}
