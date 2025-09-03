import config from "config.json";
import type GUI from "lil-gui";
import type { Scene } from "three";
import type { LightBundle } from "@/engine/lights/types";
import { bonfireConf } from "@/prefabs";

export function createLightSettings(
  gui: GUI,
  scene: Scene,
  lights: LightBundle
) {
  const { ambientLight, fireLight } = lights;

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
}
