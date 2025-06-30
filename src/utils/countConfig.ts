import { CountConfigs, ManagerTypes } from "types";
import { assets } from "../../config.json";

export function getCountConfigs(
  gltfAssets: ManagerTypes[],
  assetMap: typeof assets.gltf.randoms
): CountConfigs {
  return Object.fromEntries(
    gltfAssets.map(({ name, manager }) => {
      const key = `${name}Count`;
      return [
        key,
        {
          manager,
          opts: assetMap[name].spawnOptions,
        },
      ];
    })
  ) as CountConfigs;
}
