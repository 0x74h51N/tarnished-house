import config from "config.json";
import { CameraHelper, PerspectiveCamera } from "three";
import type { QualityKeys } from "@/types/global.types";
import { camCnfg } from ".";
import type { CameraOptions, CameraReturn } from "./types";

export function createCamera({ sizes }: CameraOptions): CameraReturn {
  const camera = new PerspectiveCamera(
    camCnfg.fov,
    sizes.width / sizes.height,
    camCnfg.near,
    camCnfg.camFar[camCnfg.defFar as QualityKeys]
  );
  camera.position.set(
    camCnfg.position.x,
    camCnfg.position.y,
    camCnfg.position.z
  );

  let cameraHelper = null;
  if (config.scene.debug.cameraHelper) {
    cameraHelper = new CameraHelper(camera);
  }

  return { camera, cameraHelper };
}
