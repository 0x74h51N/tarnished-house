import { SRGBColorSpace, WebGLRenderer } from "three";
import config from "config.json";
import {
  ShadowTypeKey,
  shadowTypes,
  ToneMappingKey,
  toneMappingMap,
} from "@/types";

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
  const rendererConfg = config.scene.renderer;

  const renderer = new WebGLRenderer({
    canvas: canvas,
    antialias: antialias,
    context: canvas.getContext("webgl2") as WebGL2RenderingContext,
    alpha: true,
  });

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, rendererConfg.maxPixelRatio)
  );

  renderer.shadowMap.enabled = rendererConfg.shadows.enabled;

  renderer.shadowMap.type =
    shadowTypes[rendererConfg.shadows.type as ShadowTypeKey];

  renderer.toneMapping =
    toneMappingMap[rendererConfg.toneMapping as ToneMappingKey];

  renderer.toneMappingExposure = rendererConfg.toneMappingExposure;
  renderer.outputColorSpace = SRGBColorSpace;

  return renderer;
}
