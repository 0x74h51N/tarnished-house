import type { CameraHelper, PerspectiveCamera, Scene, Vector3 } from "three";
import type { OrbitControls } from "three/examples/jsm/Addons";

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
export type DevUpdateFn = ((dt: number) => void) | undefined;
export interface ControlReturn {
  controls: OrbitControls;
  devUpdate?: DevUpdateFn;
}

export interface ClampFn {
  camera: PerspectiveCamera;
}

export interface ClampRtrn {
  clampCameraPosition: () => void;
}

export interface CameraPositionerInterface {
  camera: PerspectiveCamera;
  controls: OrbitControls;
}

export interface PositionArgs {
  targetPos: Vector3;
  cameraPos: Vector3;
}

export interface CameraPositionerReturn {
  setPosition: (args: PositionArgs) => void;
  restorePosition: () => void;
}
export type CamPositionerFn = ({
  camera,
  controls
}: CameraPositionerInterface) => CameraPositionerReturn;
export interface CameraSystemOptions {
  scene: Scene;
  canvas: HTMLCanvasElement;
  sizes: { width: number; height: number };
}

export interface CamController extends CameraReturn, ControlReturn, ClampRtrn {
  positioner: CameraPositionerReturn;
}
