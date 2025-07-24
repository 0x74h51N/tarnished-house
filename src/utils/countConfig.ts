import { CountConfigs, ManagerRefs } from "../components/assetLoader/types";
import config from "../../config.json";

/**
 * Transform ManagerTypes array into CountConfigs for UI controls
 */
export function getCountConfigs(
  gltfAssets: ManagerRefs[],
  assetMap: typeof config.assets.models.spawnable
): CountConfigs {
  return Object.fromEntries(
    gltfAssets.map(({ name, manager }) => {
      const key = name;
      const spawnConfig = assetMap[name].spawn;
      return [
        key,
        {
          manager,
          opts: {
            scaleMin: spawnConfig.scale.min,
            scaleMax: spawnConfig.scale.max,
            radiusMin: spawnConfig.radius.min,
            radiusMax: spawnConfig.radius.max,
            minDistance: spawnConfig.minDistance,
          },
        },
      ];
    })
  ) as CountConfigs;
}
