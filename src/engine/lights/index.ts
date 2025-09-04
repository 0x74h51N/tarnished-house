import config from "config.json";
import { AmbientLight, type Scene } from "three";
import type { CamController } from "../camController";
import { createMoonCSM } from "./cascadedMoonLight";
import type { LightBundle } from "./types";

export function createLights(
  scene: Scene,
  CamController: CamController
): LightBundle {
  // Ambient
  const ambientLight = new AmbientLight(
    config.scene.lighting.ambient.color,
    config.scene.lighting.ambient.intensity
  );
  scene.add(ambientLight);

  // Directional
  const directLight = createMoonCSM(scene, CamController.camera);

  return {
    ambientLight,
    directLight
  };
}
export * from "./types";
