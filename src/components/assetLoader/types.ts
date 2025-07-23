import { Group, Mesh } from "three";
import config from "../../../config.json";

type SpawnableConfig = typeof config.assets.models.spawnable;
export type SpawnableName = keyof SpawnableConfig & string;

export interface SpawnOptions {
  scaleMin: number;
  scaleMax: number;
  radiusMin: number;
  radiusMax: number;
  minDistance: number;
}

export type AssetTypes = {
  baseMeshes: Mesh[];
  group: Group;
};

export type ManagerTypes = {
  name: SpawnableName;
  manager: AssetTypes;
};

export type CountConfigs = Record<
  `${SpawnableName}Count`,
  {
    manager: AssetTypes;
    opts: SpawnOptions;
  }
>;
