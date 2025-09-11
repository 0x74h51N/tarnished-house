import config from "config.json";
import { AmbientLight, type Light } from "three";
import type { MapSizes, QualityKeys } from "@/types/global.types";

//fireLight animation
export const animateValue = (
  base: number,
  { speed, amplitude }: { speed: number; amplitude: number },
  elapsed: number
) => base + Math.sin(elapsed * speed) * amplitude;

//
// shadowmap size and bias utils
export function applyShadowSizeAndBias(
  lights: Light[],
  qualityKey: QualityKeys,
  mapSizes: MapSizes
) {
  const { bias, mapSize } = mapSizes[qualityKey];

  for (const l of lights) {
    if (l instanceof AmbientLight) continue;
    if (l.shadow) {
      l.shadow.mapSize.set(mapSize, mapSize);
      l.shadow.normalBias = bias.normal;
    }
  }
}

function currentShadowKey(lights: Light[]): QualityKeys {
  const { mapSizes, defMapSize } = config.scene.renderer.shadows;

  let size: number | undefined;
  for (const l of lights) {
    if (l instanceof AmbientLight) continue;
    if (l.shadow?.mapSize) {
      size = l.shadow.mapSize.x;
      break;
    }
  }
  if (size == null) return defMapSize as QualityKeys;

  for (const [key, val] of Object.entries(mapSizes) as [
    QualityKeys,
    { mapSize: number }
  ][]) {
    if (val.mapSize === size) return key;
  }
  return defMapSize as QualityKeys;
}

export function createShadowBiasProxy(lights: Light[], mapSizes: MapSizes) {
  return {
    get high() {
      return mapSizes[currentShadowKey(lights)].bias.high;
    },
    set high(v: number) {
      const k = currentShadowKey(lights);
      mapSizes[k].bias.high = v;
      applyShadowSizeAndBias(lights, k, mapSizes);
    },
    get normal() {
      return mapSizes[currentShadowKey(lights)].bias.normal;
    },
    set normal(v: number) {
      const k = currentShadowKey(lights);
      mapSizes[k].bias.normal = v;
      applyShadowSizeAndBias(lights, k, mapSizes);
    }
  };
}
