import { CameraHelper, PerspectiveCamera, Scene } from "three";
import { OrbitControls } from "three/examples/jsm/Addons";

export interface CameraOptions {
  sizes: { width: number; height: number };
}

export interface CameraReturn {
  camera: PerspectiveCamera;
  cameraHelper: CameraHelper | null;
}

export interface ControlOptions {
  camera: PerspectiveCamera;
  canvas: HTMLCanvasElement;
}

export interface ControlReturn {
  controls: OrbitControls;
}

export interface ClampFn {
  camera: PerspectiveCamera;
}

export interface ClampRtrn {
  clampCameraPosition: () => void;
}

export interface CameraSystemOptions {
  scene: Scene;
  canvas: HTMLCanvasElement;
  sizes: { width: number; height: number };
}

export interface CameraSystemReturn
  extends CameraReturn,
    ControlReturn,
    ClampRtrn {}
