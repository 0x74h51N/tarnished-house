import { Fog, PerspectiveCamera, Scene, Vector2, WebGLRenderer } from "three";

import {
  EffectComposer,
  RenderPass,
  UnrealBloomPass,
} from "three/examples/jsm/Addons";
import config from "config.json";

interface ComposerInterface {
  renderer: WebGLRenderer;
  scene: Scene;
  camera: PerspectiveCamera;
}
interface ComposerResult {
  composer: EffectComposer;
  bloomPass: UnrealBloomPass;
}

const fogSettings = config.scene.postProcessing.fog;

export const fog = new Fog(
  fogSettings.color,
  fogSettings.near,
  fogSettings.far
);
export const BLOOM_SCENE = 1;

export function createComposer({
  renderer,
  scene,
  camera,
}: ComposerInterface): ComposerResult {
  scene.fog = fog;
  const renderScene = new RenderPass(scene, camera);

  const composer = new EffectComposer(renderer);
  composer.renderToScreen = true;
  composer.addPass(renderScene);

  const { strength, radius, threshold } = config.scene.postProcessing.bloom;
  const bloomPass = new UnrealBloomPass(
    new Vector2(window.innerWidth, window.innerHeight),
    strength,
    radius,
    threshold
  );

  composer.addPass(bloomPass);

  return {
    composer,
    bloomPass,
  };
}
