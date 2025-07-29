import { Scene, OrthographicCamera } from "three";
import config from "config.json";
import GUI from "lil-gui";
import { LightBundle } from "@/Systems/Lights/types";

export function createLightSettings(
  gui: GUI,
  scene: Scene,
  lights: LightBundle
) {
  const { ambientLight, directLight, fireLight } = lights;

  const lightingFolder = gui.addFolder("Lighting Settings");
  lightingFolder.close();

  const shadowConfg = config.scene.renderer.shadows;

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

  const fireLightParam = config.scene.lighting.fireLight;
  fireLightGui
    .add(config.scene.debug.lightHelpers, "fire")
    .name("Light Helper")
    .onChange((v: boolean) => {
      if (v) {
        scene.add(fireLight.helper);
      } else {
        scene.remove(fireLight.helper);
      }
    });

  fireLightGui.add(fireLightParam, "intensity", 0, 100, 0.1).name("Intensity");

  fireLightGui.add(fireLightParam, "distance", 0, 200, 0.1).name("Distance");

  fireLightGui.add(fireLight.light, "decay", 0, 10, 0.01).name("Decay");

  // Directional Light Settings
  const directionalLightGui = lightingFolder.addFolder(
    "Directional Light Settings"
  );
  directionalLightGui.close();
  const shadowCamWidht = shadowConfg.distance.three.width;
  const shadowCamFar = shadowConfg.distance.three.far;

  const directionalLightParams = {
    shadowCameraWidth: shadowCamWidht,
    shadowCameraHeight: config.scene.lighting.directional.shadow.camera.height,
    shadowCameraNear: config.scene.lighting.directional.shadow.camera.near,
    shadowCameraFar: shadowCamFar,
    helper: config.scene.debug.lightHelpers.directional,
  };

  directionalLightGui.addColor(directLight.light, "color").name("Light Color");

  directionalLightGui
    .add(directionalLightParams, "shadowCameraWidth", 2, 95, 0.1)
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
        cam.top = half;
        cam.bottom = -half;
        cam.updateProjectionMatrix();
      }
      directLight.cameraHelper.update();
    });

  directionalLightGui
    .add(directionalLightParams, "shadowCameraHeight", 2, 100, 0.1)
    .name("Shadow Camera Height")
    .onChange((v: number) => {
      const half = v / 2;
      const cam = directLight.light.shadow.camera;
      cam.top = half;
      cam.bottom = -half;
      cam.updateProjectionMatrix();
      directLight.cameraHelper.update();
    });

  directionalLightGui
    .add(directionalLightParams, "shadowCameraNear", 0.01, 5, 0.01)
    .name("Shadow Camera Near")
    .onFinishChange((v: number) => {
      const cam = directLight.light.shadow.camera;
      if (v >= cam.far) {
        directionalLightParams.shadowCameraNear = cam.far - 0.01;
        cam.near = directionalLightParams.shadowCameraNear;
      } else {
        cam.near = v;
      }
      cam.updateProjectionMatrix();
      directLight.cameraHelper.update();
    });

  directionalLightGui
    .add(directionalLightParams, "shadowCameraFar", 10, 200, 1)
    .name("Shadow Camera Far")
    .onFinishChange((v: number) => {
      const cam = directLight.light.shadow.camera;
      if (v <= cam.near) {
        directionalLightParams.shadowCameraFar = cam.near + 0.01;
        cam.far = directionalLightParams.shadowCameraFar;
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
    .add(directLight.light.position, "x", -60, 60, 0.5)
    .name("Light X");

  directionalLightGui
    .add(directLight.light.position, "y", 0, 60, 0.5)
    .name("Light Y");

  directionalLightGui
    .add(directLight.light.position, "z", -60, 60, 0.5)
    .name("Light Z");

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
