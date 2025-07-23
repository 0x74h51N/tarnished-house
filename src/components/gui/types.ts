import {
  WebGLRenderer,
  PointLightHelper,
  DirectionalLightHelper,
  CameraHelper,
  AmbientLight,
  PerspectiveCamera,
  Light,
  Scene,
  AxesHelper,
  GridHelper,
} from "three";
import { UnrealBloomPass } from "three/examples/jsm/Addons";
import { ParticleSystemRefs } from "../particles/types";
import { ManagerTypes } from "components/assetLoader";

export interface SetupGUIInterface {
  renderer: WebGLRenderer;
  fireLightHelper: PointLightHelper;
  directionalLightHelper: DirectionalLightHelper;
  directionalLightCameraHelper: CameraHelper;
  ambientLight: AmbientLight;
  camera: PerspectiveCamera;
  cameraHelper: CameraHelper;
  gltfAssets: ManagerTypes[];
  antialias: boolean;
  onVolumeChange: (v: number) => void;
  bloomPass: UnrealBloomPass;
  lights: Light[];
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
