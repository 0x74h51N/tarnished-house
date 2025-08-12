import { detectLowEnd } from "./detectLowEnd";
import { SpawnableName } from "@/loaders";
import config from "config.json";
import assets from "assets.json";
import lowEnd from "./lowProfile.json";
import { sparkConfig, smokeConfig, flameConfig } from "@/prefabs";
import { deepAssign } from "@/utils";

export function applyLowEnd() {
  const isLowEnd = detectLowEnd();
  if (isLowEnd) {
    console.log("Low End Detected");

    config.scene.lighting.directional.enabled = lowEnd.moonLightEnabled;
    // Shadow
    const shadows = config.scene.renderer.shadows;
    deepAssign(shadows, lowEnd.shadows);
    config.scene.renderer.maxPixelRatio = lowEnd.maxPixelRatio;

    //---- Asset Settings ----

    // Particles
    const pOverrides = lowEnd.assets.particles;

    deepAssign(flameConfig, pOverrides.flame);
    deepAssign(smokeConfig, pOverrides.smoke);
    deepAssign(sparkConfig, pOverrides.sparks);

    // Random sppawn
    const orSpawn = assets.models.spawnable;
    for (const k in orSpawn) {
      const key = k as SpawnableName;
      const override = lowEnd.assets.spawnables[key].spawn || {};
      deepAssign(orSpawn[key].spawn, override);
    }

    const mobileFloor = lowEnd.assets.floor;
    deepAssign(assets.floor, mobileFloor);
  }
}
