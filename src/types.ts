import type { Mesh, Group } from "three";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader";

export type AssetTypes = {
  baseMeshes: Mesh[];
  gltf: GLTF | null;
  group: Group;
};

export type AssetOptionsTypes = {
  scaleMin: number;
  scaleMax: number;
  radiusMin: number;
  radiusMax: number;
  minDistance: number;
};

interface BaseControl {
  type: string;
  id: string;
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
