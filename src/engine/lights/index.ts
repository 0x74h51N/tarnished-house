import config from "config.json";
import { AmbientLight, type Scene } from "three";
import type { CamController } from "../camController";
import type { Player } from "../player";
import { createMoonCSM } from "./csm/light";
import { ShadowUpdateGate } from "./shadowGate";
import type { LightBundle } from "./types";

export function createLights(
  scene: Scene,
  CamController: CamController,
  player: Player
): LightBundle {
  // Ambient
  const ambientLight = new AmbientLight(
    config.scene.lighting.ambient.color,
    config.scene.lighting.ambient.intensity
  );
  scene.add(ambientLight);

  // Directional
  const csmLight = createMoonCSM(scene, CamController.camera);

  // Shadow Gate, skips shadow updates unless player moves or camera rotates
  const csmShadowGate = new ShadowUpdateGate(
    () => ({ yaw: player.ctrl.yaw, pitch: player.ctrl.pitch }),
    () => CamController.camera.position,
    3,
    2
  );

  return {
    ambientLight,
    csmLight,
    csmShadowGate
  };
}
export * from "./types";
