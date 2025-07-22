import { toneMappingMap } from "components/settings/settingsData";
import type {
  Mesh,
  Group,
  Object3D,
  Color,
  Texture,
  Matrix4Tuple,
  Vector3,
  Vector3Like,
  Vector4Like,
} from "three";

export type AssetTypes = {
  baseMeshes: Mesh[];
  group: Group;
};
export type ManagerTypes = {
  name: "trees" | "bushes" | "graves" | "roots";
  manager: AssetTypes;
};

export type CountConfigs = Record<
  `${ManagerTypes["name"]}Count`,
  {
    manager: AssetTypes;
    opts: SpawnOptions;
  }
>;

export type SpawnOptions = {
  scaleMin: number;
  scaleMax: number;
  radiusMin: number;
  radiusMax: number;
  minDistance: number;
};

interface BaseControl {
  type: string;
  id: `${ManagerTypes["name"]}Count` | string;
  label: string;
}

interface RangeControl extends BaseControl {
  type: "range";
  min: number;
  max: number;
  step: number;
  value: number;
  span: string;
}

interface CheckboxControl extends BaseControl {
  type: "checkbox";
  checked: boolean;
}

interface SelectOption {
  v: string | number;
  t: string;
  s: boolean;
}
interface SelectControl extends BaseControl {
  type: "select";
  options: SelectOption[];
}

export type GeneralControl = RangeControl | CheckboxControl | SelectControl;

export type ElevationDividers = {
  min: number;
  max: number;
};

export interface CreateParticlesInterface {
  parent: Object3D;
  color?: Color | number | string;
  opacity?: number;
  maxCount?: number;
  spawnRate?: number;
  area: number;
  size: number;
  startPozs: Vector3Like;
  textures?: Texture[] | Texture | null;
  scaleFactor: number;
  sizeGrowth?: number;
  fadeRate?: number;
  sparks?: boolean;
  damping?: number;
  elevDivs?: ElevationDividers;
  speed?: number;
  stretchFact?: number;
}

interface NoiseParams {
  noiseScale: Vector4Like;
  magnitude: number;
  lacunarity: number;
  gain: number;
  octaves: number;
}

interface MarchParams {
  iterations: number;
  rayStepFactor: number;
}

export interface FlameParticlesInterface {
  parent: Object3D;
  textures: Texture;
  startPozs: Vector3Like;
  size: number;
  speed: number;
  color?: string;
  seed?: number;
  noise: NoiseParams;
  march: MarchParams;
}

export type Steps = { delta: number; wm?: Matrix4Tuple };
export interface CreateParticlesReturn {
  step: ({ delta }: Steps) => void;
  updtScreen: () => void;
}

export type ToneMappingKey = keyof typeof toneMappingMap;
