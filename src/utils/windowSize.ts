import config from "config.json";
import type { Sizes } from "@/types/global.types";

export function createSizes(): Sizes {
  const sizes: Sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: Math.min(
      window.devicePixelRatio,
      config.scene.renderer.maxPixelRatio
    ),
    update() {
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;
      sizes.pixelRatio = Math.min(
        window.devicePixelRatio,
        config.scene.renderer.maxPixelRatio
      );
    }
  };

  return sizes;
}
