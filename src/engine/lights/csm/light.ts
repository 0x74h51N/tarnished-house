import config from "config.json";
import { Color, type PerspectiveCamera, type Scene } from "three";
import { CSM } from "three/addons/csm/CSM.js";
import type { QualityKeys } from "@/types/global.types";
import { v3 } from "@/utils";
import type { CSMLight, SyncToCam } from "../types";

export function createMoonCSM(
  scene: Scene,
  camera: PerspectiveCamera
): CSMLight {
  const {
    renderer: {
      shadows: { defMapSize, mapSizes }
    },
    lighting: {
      directional: { color, position, target, intensity, enabled }
    }
  } = config.scene;
  const defMapS = mapSizes[defMapSize as QualityKeys];

  const P = v3(position);
  const T = v3(target.position);
  const lightDir = T.clone().sub(P).normalize();
  const csm = new CSM({
    camera,
    parent: scene,
    cascades: 3,
    mode: "practical",
    lightNear: 1,
    maxFar: camera.far,
    shadowMapSize: defMapS.mapSize,
    lightDirection: lightDir,
    lightIntensity: intensity
  });

  const moonColor = new Color(color);
  csm.lights.forEach((l) => {
    l.visible = enabled;
    l.castShadow = enabled;
    l.color.copy(moonColor);
    l.shadow.normalBias = defMapS.bias.normal;
    l.shadow.autoUpdate = false;
  });
  csm.fade = true;

  const syncToCam: SyncToCam = (camera) => {
    csm.maxFar = camera.far;
    csm.updateFrustums();
    csm.update();
    csm.lights.forEach((l) => {
      l.shadow.needsUpdate = true;
    });
  };
  return { csm, syncToCam };
}
