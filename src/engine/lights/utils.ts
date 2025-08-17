//fireLight animation
export const animateValue = (
  base: number,
  { speed, amplitude }: { speed: number; amplitude: number },
  elapsed: number
) => base + Math.sin(elapsed * speed) * amplitude;
import config from "config.json";

// shadowmap size and bias utils
import { AmbientLight } from "three";
import { LightBundle } from "./types";
import { MapSizeKey, MapSizes } from "@/types/global.types";

export function applyShadowSizeAndBias(
  bundle: LightBundle,
  size: number,
  mapSizes: MapSizes
) {
  const key = size.toString() as MapSizeKey;
  const { high, normal } = mapSizes[key].bias;

  for (const lightObj of Object.values(bundle)) {
    if (lightObj instanceof AmbientLight) continue;
    const light = lightObj.light;
    light.shadow.mapSize.set(size, size);
    light.shadow.bias = high;
    light.shadow.normalBias = normal;
  }
}

function currentShadowKey(bundle: LightBundle): MapSizeKey {
  for (const l of Object.values(bundle)) {
    if (l instanceof AmbientLight) continue;
    return l.light.shadow.mapSize.x.toString() as MapSizeKey;
  }
  return config.scene.renderer.shadows.defMapSize.toString() as MapSizeKey;
}

export function createShadowBiasProxy(bundle: LightBundle, mapSizes: MapSizes) {
  return {
    get high() {
      return mapSizes[currentShadowKey(bundle)].bias.high;
    },
    set high(v: number) {
      const k = currentShadowKey(bundle);
      mapSizes[k].bias.high = v;
      applyShadowSizeAndBias(bundle, Number(k), mapSizes);
    },
    get normal() {
      return mapSizes[currentShadowKey(bundle)].bias.normal;
    },
    set normal(v: number) {
      const k = currentShadowKey(bundle);
      mapSizes[k].bias.normal = v;
      applyShadowSizeAndBias(bundle, Number(k), mapSizes);
    },
  };
}
