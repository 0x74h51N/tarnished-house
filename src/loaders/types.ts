import { Group, Mesh } from "three";
import assets from "assets.json";
import { minMax } from "@/types/global.types";
import { InstancedMesh2 } from "@three.ez/instanced-mesh";

export type rotationType = minMax | number | undefined;

export interface SpawnOpts {
  lodsCount?: number;
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
  opts: SpawnOpts;
};

type SpawnableConfig = typeof assets.models.spawnable;
export type SpawnableName = keyof SpawnableConfig;

export type SpawnableType = {
  path: string;
  spawn: SpawnOpts;
};

export type SpawnableObjects = Record<SpawnableName, SpawnableType>;

export type ManagerRefs = Record<SpawnableName, CountOpts>;
