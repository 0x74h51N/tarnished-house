import { ManagerRefs } from "components/assetLoader";
import { toneMappingMap } from "./settingsData";
import { Light, Scene, WebGLRenderer } from "three";

type InputRangeAttributes = Pick<
  HTMLInputElement,
  "min" | "max" | "step" | "value"
>;
type InputCheckboxAttributes = Pick<HTMLInputElement, "checked">;

type SelectOption = {
  v: string | number;
  t: string;
  s?: boolean;
};

export interface BaseControl<E extends HTMLElement> {
  type: string;
  id: string;
  label: string;
  onChange(e: Event & { target: E }): void;
}

export interface RangeControl
  extends BaseControl<HTMLInputElement>,
    InputRangeAttributes {
  type: "range";
  span: string;
}

export interface CheckboxControl
  extends BaseControl<HTMLInputElement>,
    InputCheckboxAttributes {
  type: "checkbox";
}

export interface SelectControl extends BaseControl<HTMLSelectElement> {
  type: "select";
  options: SelectOption[];
}

export type GeneralControl = RangeControl | CheckboxControl | SelectControl;

export type ToneMappingKey = keyof typeof toneMappingMap;

export interface SettingsInterface {
  lights: Light[];
  renderer: WebGLRenderer;
  randomMeshes: ManagerRefs[];
  antialias: boolean;
  onVolumeChange: (v: number) => void;
  scene: Scene;
  stats: Stats;
}

export type GeneralSettingsParams = Pick<
  SettingsInterface,
  "renderer" | "onVolumeChange"
>;

export type GraphicsSettingsParams = Pick<
  SettingsInterface,
  "scene" | "lights" | "renderer" | "antialias" | "stats"
>;

export type SceneSettingsParams = Pick<SettingsInterface, "randomMeshes">;
