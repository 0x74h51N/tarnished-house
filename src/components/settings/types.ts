import { ManagerRefs } from "@/loaders";
import { Scene, WebGLRenderer } from "three";
import { AudioBundle } from "@/types/global.types";
import { CamController, Composer, LightBundle } from "@/engine";

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
  hide?: boolean;
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
  toggleStats: (show: boolean) => void;
  CamController: CamController;
  syncBloom: Composer["syncBloom"];
}
export type GeneralSettingsParams = Pick<SettingsInterface, "audio">;

export type DisplaySettingsParams = Pick<
  SettingsInterface,
  "renderer" | "toggleStats"
> & {
  camera: CamController["camera"];
};

export type GraphicsSettingsParams = Pick<
  SettingsInterface,
  "scene" | "lights" | "renderer" | "antialias" | "syncBloom"
>;

export type SceneSettingsParams = Pick<SettingsInterface, "randomMeshes">;
