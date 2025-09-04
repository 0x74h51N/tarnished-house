import config from "config.json";
import type GUI from "lil-gui";
import type { CameraHelper, PerspectiveCamera, Scene } from "three";
import { camCnfg } from "@/engine";

export function createCameraSettings(
  gui: GUI,
  scene: Scene,
  camera: PerspectiveCamera,
  cameraHelper: CameraHelper
) {
  const cameraParams = {
    cameraFov: camCnfg.fov,
    cameraNear: camCnfg.near,
    cameraFar: camCnfg.far,
    cameraX: camCnfg.position.x,
    cameraY: camCnfg.position.y,
    cameraZ: camCnfg.position.z,
    cameraHelper: config.scene.debug.cameraHelper
  };

  const cameraGui = gui.addFolder("Camera Settings");
  cameraGui.close();

  cameraGui
    .add(cameraParams, "cameraFov", 10, 120, 1)
    .name("FOV")
    .onChange((v: number) => {
      camera.fov = v;
      camera.updateProjectionMatrix();
      cameraHelper.update();
    });

  cameraGui
    .add(cameraParams, "cameraNear", 0.01, 10, 0.01)
    .name("Near")
    .onChange((v: number) => {
      camera.near = v;
      camera.updateProjectionMatrix();
      cameraHelper.update();
    });

  cameraGui
    .add(cameraParams, "cameraFar", 1, 500, 1)
    .name("Far")
    .onChange((v: number) => {
      camera.far = v;
      camera.updateProjectionMatrix();
      cameraHelper.update();
    });

  cameraGui
    .add(cameraParams, "cameraX", -50, 50, 0.1)
    .name("Position X")
    .onChange((v: number) => {
      camera.position.x = v;
      cameraHelper.update();
    });

  cameraGui
    .add(cameraParams, "cameraY", -50, 50, 0.1)
    .name("Position Y")
    .onChange((v: number) => {
      camera.position.y = v;
      cameraHelper.update();
    });

  cameraGui
    .add(cameraParams, "cameraZ", -50, 50, 0.1)
    .name("Position Z")
    .onChange((v: number) => {
      camera.position.z = v;
      cameraHelper.update();
    });

  cameraGui
    .add(cameraParams, "cameraHelper")
    .name("Show Helper")
    .onChange((v: boolean) => {
      if (v) {
        scene.add(cameraHelper);
      } else {
        scene.remove(cameraHelper);
      }
    });
}
