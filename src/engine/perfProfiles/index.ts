import assets from "assets.json";
import config from "config.json";
import type { SpawnableName } from "@/loaders";
import { flameConf, smokeConf, sparkConf } from "@/prefabs";
import { deepAssign } from "@/utils";
import { camCnfg } from "..";
import { detectPerf } from "./detect";
import midJSON from "./midProfile.json";
import patatoJSON from "./patatoProfile.json";

type PerfProfile = typeof patatoJSON;

export async function applyPerfProfile() {
  const tier = await detectPerf();
  if (!tier) {
    console.log("not detection");
    return;
  }

  const profile = (tier === "patato" ? patatoJSON : midJSON) as PerfProfile;
  console.log(tier, " detected!");

  // Controls
  if (profile.camera) deepAssign(camCnfg, profile.camera);

  // Scene
  if (profile.scene) deepAssign(config.scene, profile.scene);

  // Particles
  const p = profile.assets?.particles;
  if (p?.flame) deepAssign(flameConf, p.flame);
  if (p?.smoke) deepAssign(smokeConf, p.smoke);
  if (p?.sparks) deepAssign(sparkConf, p.sparks);

  // Spawnables
  const sp = profile.assets?.spawnables;
  if (sp) {
    const base = assets.models.spawnable;
    for (const k in base) {
      const key = k as SpawnableName;
      const override = sp[key]?.spawn;
      if (override) deepAssign(base[key].spawn, override);
    }
  }

  // Floor
  const floor = profile.assets?.floor;
  if (floor) deepAssign(assets.floor, floor);
}
