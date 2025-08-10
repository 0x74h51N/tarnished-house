import { detectLowEnd } from "./detectLowEnd";
import { SpawnableName } from "@/loaders";
import config from "config.json";
import { ParticleConfigs, ParticleName, PointProps } from "../particles";
import lowEnd from "./lowProfile.json";

export function applyLowEnd() {
  const isLowEnd = detectLowEnd();

  if (isLowEnd) {
    console.log("Low End Detected");

    config.scene.lighting.directional.enabled = lowEnd.moonLightEnabled;

    // Shadow
    config.scene.renderer.shadows = {
      ...config.scene.renderer.shadows,
      ...lowEnd.shadows,
    };

    config.scene.renderer.maxPixelRatio = lowEnd.maxPixelRatio;

    //---- Asset Settings ----
    const assets = config.assets;

    // Particles
    const orParticles = assets.particles as ParticleConfigs;
    const mobileParticles = lowEnd.assets
      .particles as unknown as Partial<ParticleConfigs>;

    for (const k in orParticles) {
      const key = k as ParticleName;
      const orig = orParticles[key];

      const override = mobileParticles[key];
      if (!override?.properties) continue;

      //TODO deep merge function
      orParticles[key] = {
        ...orig,
        properties: {
          ...orig.properties,
          ...override.properties,
          ...((override.properties as PointProps).sparkProps && {
            sparkProps: {
              ...(orig.properties as PointProps).sparkProps,
              ...(override.properties as PointProps).sparkProps,
            },
          }),
        },
      };
    }

    // Random sppawn
    const orSpawn = assets.models.spawnable;
    for (const k in orSpawn) {
      const key = k as SpawnableName;
      const override = lowEnd.assets.spawnables[key].spawn || {};

      //TODO deep merge function
      orSpawn[key].spawn = {
        ...orSpawn[key].spawn,
        ...override,
      };
    }

    // Floor - TODO deep merge function
    const mobileFloor = lowEnd.assets.floor;
    assets.floor = {
      ...assets.floor,
      ...mobileFloor,
      textures: {
        ...assets.floor.textures,
        ...mobileFloor.textures,
      },
      geometry: {
        ...assets.floor.geometry,
        ...mobileFloor.geometry,
      },
    };
  }
}
