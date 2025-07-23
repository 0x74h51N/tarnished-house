import { ManagerTypes } from "components/assetLoader";
import { toneMappingMap } from "./settingsData";

interface BaseControl {
  type: string;
  id: `${ManagerTypes["name"]}Count` | string;
  label: string;
}

export interface RangeControl extends BaseControl {
  type: "range";
  min: number;
  max: number;
  step: number;
  value: number;
  span: string;
}

export interface CheckboxControl extends BaseControl {
  type: "checkbox";
  checked: boolean;
}

interface SelectOption {
  v: string | number;
  t: string;
  s: boolean;
}

export interface SelectControl extends BaseControl {
  type: "select";
  options: SelectOption[];
}

export type GeneralControl = RangeControl | CheckboxControl | SelectControl;

export type ToneMappingKey = keyof typeof toneMappingMap;
