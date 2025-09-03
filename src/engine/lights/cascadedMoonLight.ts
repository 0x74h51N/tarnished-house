import config from "config.json";
import { Color, type PerspectiveCamera, type Scene } from "three";
import { CSM } from "three/addons/csm/CSM.js";
import type { MapSizeKey } from "@/types/global.types";
import { v3 } from "@/utils";

export function createMoonCSM(scene: Scene, camera: PerspectiveCamera) {
  const {
    renderer: {
      shadows: { defMapSize, defMaxFar, maxFar, mapSizes }
    },
    lighting: {
      directional: { color, position, target, intensity }
    }
  } = config.scene;
  const normalBias = mapSizes[defMapSize.toString() as MapSizeKey].bias.normal;
  const P = v3(position);
  const T = v3(target.position);
  const lightDir = T.clone().sub(P).normalize();
  const csm = new CSM({
    camera,
    parent: scene,
    cascades: 3,
    mode: "practical",
    lightNear: 1,
    maxFar: maxFar[defMaxFar as keyof typeof maxFar],
    shadowMapSize: defMapSize,
    lightDirection: lightDir,
    lightIntensity: intensity
  });

  const moonColor = new Color(color);
  csm.lights.forEach((l) => {
    l.color.copy(moonColor);
    l.shadow.normalBias = normalBias;
  });

  return csm;
}
