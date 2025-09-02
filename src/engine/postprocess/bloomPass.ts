import config from "config.json";
import { Vector2 } from "three";
import { UnrealBloomPass } from "three/examples/jsm/Addons.js";

export function createBloomPass(): UnrealBloomPass {
  const { strength, radius, threshold } = config.scene.postProcessing.bloom;
  return new UnrealBloomPass(
    new Vector2(window.innerWidth, window.innerHeight),
    strength,
    radius,
    threshold
  );
}
