import { SRGBColorSpace, WebGLRenderer } from "three";
import config from "config.json";
import {
  ShadowTypeKey,
  shadowTypes,
  Sizes,
  ToneMappingKey,
  toneMappingMap,
} from "@/types/global.types";

interface RendererInterface {
  sizes: Sizes;
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
    premultipliedAlpha: false,
    powerPreference: "high-performance",
  });
  if (!renderer.capabilities.isWebGL2) {
    throw new Error("WebGL2 required for GLSL3 shaders.");
  }

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(sizes.pixelRatio);

  renderer.shadowMap.enabled = rendererConfg.shadows.enabled;

  renderer.shadowMap.type =
    shadowTypes[rendererConfg.shadows.type as ShadowTypeKey];

  renderer.toneMapping =
    toneMappingMap[rendererConfg.toneMapping as ToneMappingKey];

  renderer.toneMappingExposure = rendererConfg.toneMappingExposure;
  renderer.outputColorSpace = SRGBColorSpace;

  return renderer;
}
