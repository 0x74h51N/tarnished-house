import type { CameraHelper, PerspectiveCamera, Scene, Vector3 } from "three";
import type { OrbitControls } from "three/examples/jsm/Addons.js";
import type { ClampRtrn, FPSController, FreeController } from "./controller";

export interface CameraOptions {
  sizes: { width: number; height: number };
}

export interface CameraReturn {
  camera: PerspectiveCamera;
  cameraHelper: CameraHelper | null;
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

export type CamPositionerFn = (
  args: CameraPositionerInterface
) => CameraPositionerReturn;

export interface CameraSystemOptions {
  scene: Scene;
  canvas: HTMLCanvasElement;
  sizes: { width: number; height: number };
}

export interface CamController extends CameraReturn, ClampRtrn {
  FreeController: FreeController;
  FPSController: FPSController;
}
