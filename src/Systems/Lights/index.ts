import { Scene, AmbientLight } from "three";
import config from "config.json";
import { createFireLight } from "./fireLight";
import { createDirectLight } from "./directionalLight";
import { LightBundle } from "./types";

export function createLights(scene: Scene): LightBundle {
  // Ambient
  const ambientLight = new AmbientLight(
    config.scene.lighting.ambient.color,
    config.scene.lighting.ambient.intensity
  );
  scene.add(ambientLight);

  // Directional
  const directLight = createDirectLight(scene);

  // Fire point light
  const fireLight = createFireLight(scene);

  return {
    ambientLight,
    fireLight,
    directLight,
  };
}
