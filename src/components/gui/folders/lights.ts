import {
  AmbientLight,
  PointLight,
  DirectionalLight,
  PointLightHelper,
  DirectionalLightHelper,
  CameraHelper,
  Scene,
  OrthographicCamera,
} from "three";
import config from "../../../../config.json";
import GUI from "lil-gui";

export function createLightSettings(
  gui: GUI,
  scene: Scene,
  ambientLight: AmbientLight,
  fireLight: PointLight,
  directionalLight: DirectionalLight,
  fireLightHelper: PointLightHelper,
  directionalLightHelper: DirectionalLightHelper,
  directionalLightCameraHelper: CameraHelper
) {
  const lightingFolder = gui.addFolder("Lighting Settings");
  lightingFolder.close();

  const textureQuality = config.quality.textureQuality;

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

  const fireLightParams = {
    helper: config.scene.debug.lightHelpers.fire,
  };

  fireLightGui
    .add(fireLightParams, "helper")
    .name("Light Helper")
    .onChange((v: boolean) => {
      if (v) {
        scene.add(fireLightHelper);
      } else {
        scene.remove(fireLightHelper);
      }
    });

  fireLightGui.add(fireLight, "intensity", 0, 100, 0.1).name("Intensity");

  fireLightGui.add(fireLight, "distance", 0, 200, 0.1).name("Distance");

  fireLightGui.add(fireLight, "decay", 0, 10, 0.01).name("Decay");

  fireLightGui
    .add(textureQuality.high, "bias", -0.01, 0.01, 0.0001)
    .name("Shadow Bias")
    .onChange((v: number) => {
      if (fireLight.shadow) {
        fireLight.shadow.bias = v;
        fireLight.shadow.normalBias = v;
      }
    });

  fireLightGui
    .add(textureQuality.high, "normalBias", 0, 1, 0.001)
    .name("Normal Bias")
    .onChange((v: number) => {
      if (fireLight.shadow) {
        fireLight.shadow.normalBias = v;
      }
    });

  // Directional Light Settings
  const directionalLightGui = lightingFolder.addFolder(
    "Directional Light Settings"
  );
  directionalLightGui.close();

  const directionalLightParams = {
    shadowCameraWidth: config.scene.lighting.directional.shadow.camera.width,
    shadowCameraHeight: config.scene.lighting.directional.shadow.camera.height,
    shadowCameraNear: config.scene.lighting.directional.shadow.camera.near,
    shadowCameraFar: config.scene.lighting.directional.shadow.camera.far,
    helper: config.scene.debug.lightHelpers.directional,
  };

  directionalLightGui.addColor(directionalLight, "color").name("Light Color");

  directionalLightGui
    .add(directionalLightParams, "shadowCameraWidth", 2, 95, 0.1)
    .name("Shadow Camera Width")
    .onChange((v: number) => {
      const half = v / 2;
      if (
        directionalLight.shadow &&
        directionalLight.shadow.camera instanceof OrthographicCamera
      ) {
        const cam = directionalLight.shadow.camera;
        cam.left = -half;
        cam.right = half;
        cam.top = half;
        cam.bottom = -half;
        cam.updateProjectionMatrix();
      }
      directionalLightCameraHelper.update();
    });

  directionalLightGui
    .add(directionalLightParams, "shadowCameraHeight", 2, 100, 0.1)
    .name("Shadow Camera Height")
    .onChange((v: number) => {
      const half = v / 2;
      const cam = directionalLight.shadow.camera as OrthographicCamera;
      cam.top = half;
      cam.bottom = -half;
      cam.updateProjectionMatrix();
      directionalLightCameraHelper.update();
    });

  directionalLightGui
    .add(directionalLightParams, "shadowCameraNear", 0.01, 5, 0.01)
    .name("Shadow Camera Near")
    .onFinishChange((v: number) => {
      const cam = directionalLight.shadow.camera;
      if (v >= cam.far) {
        directionalLightParams.shadowCameraNear = cam.far - 0.01;
        cam.near = directionalLightParams.shadowCameraNear;
      } else {
        cam.near = v;
      }
      cam.updateProjectionMatrix();
      directionalLightCameraHelper.update();
    });

  directionalLightGui
    .add(directionalLightParams, "shadowCameraFar", 10, 200, 1)
    .name("Shadow Camera Far")
    .onFinishChange((v: number) => {
      const cam = directionalLight.shadow.camera;
      if (v <= cam.near) {
        directionalLightParams.shadowCameraFar = cam.near + 0.01;
        cam.far = directionalLightParams.shadowCameraFar;
      } else {
        cam.far = v;
      }
      cam.updateProjectionMatrix();
      directionalLightCameraHelper.update();
    });

  directionalLightGui
    .add(directionalLight, "intensity", 0, 10, 0.1)
    .name("Light Intensity");

  directionalLightGui
    .add(directionalLight.position, "x", -60, 60, 0.5)
    .name("Light X");

  directionalLightGui
    .add(directionalLight.position, "y", 0, 60, 0.5)
    .name("Light Y");

  directionalLightGui
    .add(directionalLight.position, "z", -60, 60, 0.5)
    .name("Light Z");

  directionalLightGui
    .add(directionalLightParams, "helper")
    .name("Light Helper")
    .onChange((v: boolean) => {
      if (v) {
        scene.add(directionalLightHelper);
        scene.add(directionalLightCameraHelper);
      } else {
        scene.remove(directionalLightHelper);
        scene.remove(directionalLightCameraHelper);
      }
    });

  directionalLightGui
    .add(textureQuality.high, "bias", -0.01, 0.01, 0.0001)
    .name("Shadow Bias")
    .onChange((v: number) => {
      directionalLight.shadow.bias = v;
    });

  directionalLightGui
    .add(textureQuality.high, "normalBias", 0, 1, 0.001)
    .name("Normal Bias")
    .onChange((v: number) => {
      directionalLight.shadow.normalBias = v;
    });
}
