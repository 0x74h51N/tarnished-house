import { Group, Mesh } from "three";
import config from "config.json";

type minMax = { min: number; max: number };

export type rotationType = minMax | number | undefined;

export interface SpawnOptions {
  count: number;
  scale: minMax;
  radius: minMax;
  minDistance: number;
  castShadow: boolean;
  receiveShadow: boolean;
  yPosition?: number;
  getGeoCenterXZ?: boolean;
  rotation?: {
    x?: rotationType;
    y?: rotationType;
    z?: rotationType;
  };
}

export type ManagerType = {
  baseMeshes: Mesh[];
  group: Group;
};

export type CountOpts = {
  manager: ManagerType;
  opts: SpawnOptions;
};

type SpawnableConfig = typeof config.assets.models.spawnable;
export type SpawnableName = keyof SpawnableConfig;

export type SpawnableType = {
  path: string;
  meshPath: number[];
  spawn: SpawnOptions;
};

export type ManagerRefs = Record<SpawnableName, CountOpts>;
