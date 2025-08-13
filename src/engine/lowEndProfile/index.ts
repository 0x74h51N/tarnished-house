import { detectLowEnd } from "./detectLowEnd";
import { SpawnableName } from "@/loaders";
import config from "config.json";
import assets from "assets.json";
import lowEnd from "./lowProfile.json";
import { sparkConf, smokeConf, flameConf } from "@/prefabs";
import { deepAssign } from "@/utils";

export async function applyLowEnd() {
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

    deepAssign(flameConf, pOverrides.flame);
    deepAssign(smokeConf, pOverrides.smoke);
    deepAssign(sparkConf, pOverrides.sparks);

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
