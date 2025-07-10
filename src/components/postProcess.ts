import { PerspectiveCamera, Scene, Vector2, WebGLRenderer } from "three";
import {
  EffectComposer,
  RenderPass,
  UnrealBloomPass,
} from "three/examples/jsm/Addons";
import config from "../../config.json";

interface ComposerInterface {
  renderer: WebGLRenderer;
  scene: Scene;
  camera: PerspectiveCamera;
}
interface ComposerResult {
  composer: EffectComposer;
  bloomPass: UnrealBloomPass;
}

export function createComposer({
  renderer,
  scene,
  camera,
}: ComposerInterface): ComposerResult {
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  const { strength, radius, threshold } = config.scene.postProcessing.bloom;
  const bloomPass = new UnrealBloomPass(
    new Vector2(window.innerWidth, window.innerHeight),
    strength,
    radius,
    threshold
  );
  composer.addPass(bloomPass);

  return { composer, bloomPass };
}
