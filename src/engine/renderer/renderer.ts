import {
  ACESFilmicToneMapping,
  PCFSoftShadowMap,
  SRGBColorSpace,
  WebGLRenderer,
} from "three";
import config from "config.json";

interface RendererInterface {
  sizes: { width: number; height: number };
  canvas: HTMLCanvasElement;
  antialias: boolean;
}

export function createRenderer({
  sizes,
  canvas,
  antialias,
}: RendererInterface): WebGLRenderer {
  const renderer = new WebGLRenderer({
    canvas: canvas,
    antialias: antialias,
    context: canvas.getContext("webgl2") as WebGL2RenderingContext,
    alpha: true,
  });
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, config.scene.renderer.maxPixelRatio)
  );
  renderer.shadowMap.enabled = config.scene.renderer.shadows.enabled;
  renderer.shadowMap.type = PCFSoftShadowMap;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = config.scene.renderer.toneMappingExposure;
  renderer.outputColorSpace = SRGBColorSpace;

  return renderer;
}
