import type { PerspectiveCamera, Scene, WebGLRenderer } from "three";
import {
  EffectComposer,
  RenderPass,
  type UnrealBloomPass
} from "three/examples/jsm/Addons";
import config from "config.json";
import { createBloomPass } from "./bloomPass";
import { fog } from "./fog";

export const BLOOM_SCENE = 1;

export interface ComposerInterface {
  renderer: WebGLRenderer;
  scene: Scene;
  camera: PerspectiveCamera;
}

export interface Composer {
  composer: EffectComposer;
  bloomPass: UnrealBloomPass;
  syncBloom: () => void;
}

export function createComposer({
  renderer,
  scene,
  camera
}: ComposerInterface): Composer {
  scene.fog = config.scene.postProcessing.fog.enabled ? fog : null;

  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  const bloomPass = createBloomPass();
  const bloom = config.scene.postProcessing.bloom;

  const syncBloom = () => {
    const has = composer.passes.includes(bloomPass);
    if (bloom.enabled && !has) composer.addPass(bloomPass);
    else if (!bloom.enabled && has) composer.removePass(bloomPass);
  };

  syncBloom();

  return { composer, bloomPass, syncBloom };
}
