import { ManagerRefs } from "@/loaders";
import { Scene, WebGLRenderer } from "three";
import { AudioBundle } from "@/types";
import { CameraPositionerReturn, LightBundle } from "@/engine";

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

export interface SettingsInterface {
  lights: LightBundle;
  renderer: WebGLRenderer;
  randomMeshes: ManagerRefs;
  antialias: boolean;
  audio: AudioBundle;
  scene: Scene;
  stats: Stats;
  camPositioner: CameraPositionerReturn;
}
export type GeneralSettingsParams = Pick<
  SettingsInterface,
  "renderer" | "audio"
>;

export type GraphicsSettingsParams = Pick<
  SettingsInterface,
  "scene" | "lights" | "renderer" | "antialias" | "stats"
>;

export type SceneSettingsParams = Pick<SettingsInterface, "randomMeshes">;
