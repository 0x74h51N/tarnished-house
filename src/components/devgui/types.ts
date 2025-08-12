import { WebGLRenderer, Scene, AxesHelper, GridHelper } from "three";
import { UnrealBloomPass } from "three/examples/jsm/Addons";
import { ManagerRefs } from "@/loaders";
import { CamController, LightBundle } from "@/engine";
import { AudioBundle } from "@/types";
import { BonfireParticles } from "@/prefabs";

export interface SetupGUIInterface {
  renderer: WebGLRenderer;
  CamController: CamController;
  randomMeshes: ManagerRefs;
  antialias: boolean;
  audio: AudioBundle;
  bloomPass: UnrealBloomPass;
  lights: LightBundle;
  scene: Scene;
  particleSystems: BonfireParticles;
}

export interface HelperParams {
  showAxes: boolean;
  axesSize: number;
  axesPositionX: number;
  axesPositionY: number;
  axesPositionZ: number;
  showGrid: boolean;
  gridSize: number;
  gridDivisions: number;
  gridPositionY: number;
}

export interface HelperState {
  axes: AxesHelper | null;
  grid: GridHelper | null;
}
