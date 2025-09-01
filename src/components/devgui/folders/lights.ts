import config from "config.json";
import type GUI from "lil-gui";
import { OrthographicCamera, type Scene } from "three";
import type { LightBundle } from "@/engine/lights/types";
import { bonfireConf } from "@/prefabs";

export function createLightSettings(
  gui: GUI,
  scene: Scene,
  lights: LightBundle
) {
  const { ambientLight, directLight, fireLight } = lights;

  const lightingFolder = gui.addFolder("Lighting Settings");
  lightingFolder.close();

  // Ambient Light Settings
  const ambientLightGui = lightingFolder.addFolder("Ambient Light Settings");
  ambientLightGui.close();

  ambientLightGui
    .add(ambientLight, "intensity", 0, 10, 0.1)
    .name("Light Intensity");

  ambientLightGui.addColor(ambientLight, "color").name("Light Color");

  // Fire Light Settings
  const fireLightGui = lightingFolder.addFolder("Fire Light Settings");
  fireLightGui.close();

  const fireLightParam = bonfireConf.fireLight;
  if (fireLight) {
    fireLightGui
      .add(config.scene.debug.lightHelpers, "fire")
      .name("Light Helper")
      .onChange((v: boolean) => {
        v ? scene.add(fireLight.helper) : scene.remove(fireLight.helper);
      });

    fireLightGui
      .add(fireLightParam, "intensity", 0, 100, 0.1)
      .name("Intensity");

    fireLightGui.add(fireLightParam, "distance", 0, 200, 0.1).name("Distance");

    fireLightGui.add(fireLight.light, "decay", 0, 10, 0.01).name("Decay");
  }

  // Directional Light Settings
  const directionalLightGui = lightingFolder.addFolder(
    "Directional Light Settings"
  );
  directionalLightGui.close();

  const directionalLightParams = {
    shadowCameraWidth: directLight.light.shadow.camera.right * 2,
    shadowCameraHeight: directLight.light.shadow.camera.top * 2,
    shadowCameraNear: directLight.light.shadow.camera.near,
    shadowCameraFar: directLight.light.shadow.camera.far,
    helper: config.scene.debug.lightHelpers.directional,
    targetX: directLight.light.target.position.x,
    targetY: directLight.light.target.position.y,
    targetZ: directLight.light.target.position.z
  };

  directionalLightGui.addColor(directLight.light, "color").name("Light Color");

  directionalLightGui
    .add(directionalLightParams, "shadowCameraWidth", 2, 500, 0.1)
    .name("Shadow Camera Width")
    .onChange((v: number) => {
      const half = v / 2;
      if (
        directLight.light.shadow &&
        directLight.light.shadow.camera instanceof OrthographicCamera
      ) {
        const cam = directLight.light.shadow.camera;
        cam.left = -half;
        cam.right = half;
        cam.updateProjectionMatrix();
      }
      directLight.cameraHelper.update();
    });

  directionalLightGui
    .add(directionalLightParams, "shadowCameraHeight", 2, 500, 0.1)
    .name("Shadow Camera Height")
    .onChange((v: number) => {
      const half = v / 2;
      const cam = directLight.light.shadow.camera;
      if (cam instanceof OrthographicCamera) {
        cam.top = half;
        cam.bottom = -half;
        cam.updateProjectionMatrix();
        directLight.cameraHelper.update();
      }
    });

  directionalLightGui
    .add(directionalLightParams, "shadowCameraNear", 0.01, 5, 0.1)
    .name("Shadow Camera Near")
    .onFinishChange((v: number) => {
      const cam = directLight.light.shadow.camera;
      if (v >= cam.far) {
        cam.near = cam.far - 0.01;
      } else {
        cam.near = v;
      }
      cam.updateProjectionMatrix();
      directLight.cameraHelper.update();
    });

  directionalLightGui
    .add(directionalLightParams, "shadowCameraFar", 10, 500, 1)
    .name("Shadow Camera Far")
    .onFinishChange((v: number) => {
      const cam = directLight.light.shadow.camera;
      if (v <= cam.near) {
        cam.far = cam.near + 0.01;
      } else {
        cam.far = v;
      }
      cam.updateProjectionMatrix();
      directLight.cameraHelper.update();
    });

  directionalLightGui
    .add(directLight.light, "intensity", 0, 10, 0.1)
    .name("Light Intensity");

  directionalLightGui
    .add(directLight.light.position, "x", -400, 400, 0.5)
    .name("Light X")
    .onChange(() => {
      directLight.helper.update();
      directLight.cameraHelper.update();
    });

  directionalLightGui
    .add(directLight.light.position, "y", 0, 400, 0.5)
    .name("Light Y")
    .onChange(() => {
      directLight.helper.update();
      directLight.cameraHelper.update();
    });

  directionalLightGui
    .add(directLight.light.position, "z", -400, 400, 0.5)
    .name("Light Z")
    .onChange(() => {
      directLight.helper.update();
      directLight.cameraHelper.update();
    });

  directionalLightGui
    .add(directionalLightParams, "targetX", -400, 400, 0.5)
    .name("Target X")
    .onChange((v: number) => {
      directLight.light.target.position.x = v;
      directLight.light.target.updateMatrixWorld();
      directLight.helper.update();
      directLight.cameraHelper.update();
    });

  directionalLightGui
    .add(directionalLightParams, "targetY", -400, 400, 0.5)
    .name("Target Y")
    .onChange((v: number) => {
      directLight.light.target.position.y = v;
      directLight.light.target.updateMatrixWorld();
      directLight.helper.update();
      directLight.cameraHelper.update();
    });

  directionalLightGui
    .add(directionalLightParams, "targetZ", -400, 400, 0.5)
    .name("Target Z")
    .onChange((v: number) => {
      directLight.light.target.position.z = v;
      directLight.light.target.updateMatrixWorld();
      directLight.helper.update();
      directLight.cameraHelper.update();
    });

  directionalLightGui
    .add(directionalLightParams, "helper")
    .name("Light Helper")
    .onChange((v: boolean) => {
      if (v) {
        scene.add(directLight.cameraHelper);
        scene.add(directLight.helper);
      } else {
        scene.remove(directLight.cameraHelper);
        scene.remove(directLight.helper);
      }
    });
}
