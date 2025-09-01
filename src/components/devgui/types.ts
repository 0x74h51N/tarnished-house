import type { WebGLRenderer, Scene, AxesHelper, GridHelper } from "three";
import type { UnrealBloomPass } from "three/examples/jsm/Addons";
import type { ManagerRefs } from "@/loaders";
import type { CamController, Composer, LightBundle } from "@/engine";
import type { AudioBundle } from "@/types/global.types";
import type { BonfireParticles } from "@/prefabs";
import type GUI from "lil-gui";

export interface SetupGUIInterface {
  devMode: boolean;
  renderer: WebGLRenderer;
  CamController: CamController;
  randomMeshes: ManagerRefs;
  antialias: boolean;
  audio: AudioBundle;
  bloomPass: UnrealBloomPass;
  lights: LightBundle;
  scene: Scene;
  particleSystems: BonfireParticles;
  syncBloom: Composer["syncBloom"];
}

export interface HelperState {
  axes: AxesHelper | null;
  grid: GridHelper | null;
}

export type RuntimeCtrl = {
  isPaused: () => boolean;
  togglePause: () => void;
  timeScale: number;
};

export interface SetupGUI {
  gui: GUI;
  runtime: RuntimeCtrl;
}
