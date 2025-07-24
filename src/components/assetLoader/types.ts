import { Group, Mesh } from "three";
import config from "../../../config.json";

type SpawnableConfig = typeof config.assets.models.spawnable;
export type SpawnableName = keyof SpawnableConfig;

export interface SpawnOptions {
  scaleMin: number;
  scaleMax: number;
  radiusMin: number;
  radiusMax: number;
  minDistance: number;
}

export type ManagerType = {
  baseMeshes: Mesh[];
  group: Group;
};

export type ManagerRefs = {
  name: SpawnableName;
  manager: ManagerType;
};

export type CountOpts = {
  manager: ManagerType;
  opts: SpawnOptions;
};
export type CountConfigs = Record<SpawnableName, CountOpts>;
