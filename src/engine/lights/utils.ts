//fireLight animation
export const animateValue = (
  base: number,
  { speed, amplitude }: { speed: number; amplitude: number },
  elapsed: number
) => base + Math.sin(elapsed * speed) * amplitude;

import config from "config.json";

// shadowmap size and bias utils
import { AmbientLight, type Light } from "three";
import type { MapSizeKey, MapSizes } from "@/types/global.types";

export function applyShadowSizeAndBias(
  lights: Light[],
  size: number,
  mapSizes: MapSizes
) {
  const key = size.toString() as MapSizeKey;
  const { normal } = mapSizes[key].bias;

  for (const l of lights) {
    if (l instanceof AmbientLight) continue;
    if (l.shadow) {
      l.shadow.mapSize.set(size, size);
      l.shadow.normalBias = normal;
    }
  }
}

function currentShadowKey(lights: Light[]): MapSizeKey {
  for (const l of lights) {
    if (l instanceof AmbientLight) continue;
    if (l.shadow) return l.shadow.mapSize.x.toString() as MapSizeKey;
  }
  return config.scene.renderer.shadows.defMapSize.toString() as MapSizeKey;
}

export function createShadowBiasProxy(lights: Light[], mapSizes: MapSizes) {
  return {
    get high() {
      return mapSizes[currentShadowKey(lights)].bias.high;
    },
    set high(v: number) {
      const k = currentShadowKey(lights);
      mapSizes[k].bias.high = v;
      applyShadowSizeAndBias(lights, Number(k), mapSizes);
    },
    get normal() {
      return mapSizes[currentShadowKey(lights)].bias.normal;
    },
    set normal(v: number) {
      const k = currentShadowKey(lights);
      mapSizes[k].bias.normal = v;
      applyShadowSizeAndBias(lights, Number(k), mapSizes);
    }
  };
}
