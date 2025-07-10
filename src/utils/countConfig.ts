import { CountConfigs, ManagerTypes } from "types";
import config from "../../config.json";

export function getCountConfigs(
  gltfAssets: ManagerTypes[],
  assetMap: typeof config.assets.models.spawnable
): CountConfigs {
  return Object.fromEntries(
    gltfAssets.map(({ name, manager }) => {
      const key = `${name}Count`;
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
