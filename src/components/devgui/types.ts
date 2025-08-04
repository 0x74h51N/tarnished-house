import { WebGLRenderer, Scene, AxesHelper, GridHelper } from "three";
import { UnrealBloomPass } from "three/examples/jsm/Addons";
import { ManagerRefs } from "@/loaders";
import { CameraSystemReturn, LightBundle, ParticleSystemRefs } from "@/engine";
import { AudioBundle } from "@/types";

export interface SetupGUIInterface {
  renderer: WebGLRenderer;
  CamController: CameraSystemReturn;
  randomMeshes: ManagerRefs;
  antialias: boolean;
  audio: AudioBundle;
  bloomPass: UnrealBloomPass;
  lights: LightBundle;
  scene: Scene;
  particleSystems: ParticleSystemRefs;
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
