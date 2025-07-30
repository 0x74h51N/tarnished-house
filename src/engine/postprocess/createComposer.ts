import { PerspectiveCamera, Scene, WebGLRenderer } from "three";
import {
  EffectComposer,
  RenderPass,
  UnrealBloomPass,
} from "three/examples/jsm/Addons";

import { createBloomPass } from "./bloomPass";
import { fog } from "./fog";

export const BLOOM_SCENE = 1;

export interface ComposerInterface {
  renderer: WebGLRenderer;
  scene: Scene;
  camera: PerspectiveCamera;
}

export interface ComposerResult {
  composer: EffectComposer;
  bloomPass: UnrealBloomPass;
}

export function createComposer({
  renderer,
  scene,
  camera,
}: ComposerInterface): ComposerResult {
  scene.fog = fog;

  const composer = new EffectComposer(renderer);
  composer.renderToScreen = true;

  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  const bloomPass = createBloomPass();
  composer.addPass(bloomPass);

  return { composer, bloomPass };
}
