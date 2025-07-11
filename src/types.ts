import { toneMappingMap } from "components/settings/settingsData";
import type {
  Mesh,
  Group,
  Object3D,
  Color,
  PerspectiveCamera,
  Texture,
  Points,
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
  maxCount: number;
  spawnRate: number;
  area: number;
  size: number;
  startPozs: number[];
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

export interface CreateParticlesReturn {
  points: Points[];
  step: (delta: number) => void;
  updtScreen: () => void;
}

export type ToneMappingKey = keyof typeof toneMappingMap;
