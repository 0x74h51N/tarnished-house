import { UnrealBloomPass } from "three/examples/jsm/Addons";
import { Vector2 } from "three";
import config from "config.json";

export function createBloomPass(): UnrealBloomPass {
  const { strength, radius, threshold } = config.scene.postProcessing.bloom;
  return new UnrealBloomPass(
    new Vector2(window.innerWidth, window.innerHeight),
    strength,
    radius,
    threshold
  );
}
