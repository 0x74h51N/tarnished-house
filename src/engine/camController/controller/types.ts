import type { JoystickManagerOptions } from "nipplejs";
import type { PerspectiveCamera } from "three";
import type { OrbitControls } from "three/examples/jsm/Addons.js";

export type StaticPosition = NonNullable<JoystickManagerOptions["position"]>;

export interface JoystickArgs {
  position: StaticPosition;
  size: number;
  multitouch?: boolean;
  restOpacity?: number;
}

export interface ControlOptions {
  camera: PerspectiveCamera;
  canvas: HTMLCanvasElement;
}
export type controllerFn = ((dt: number) => void) | undefined;
export interface ControlReturn {
  controls: OrbitControls;
  controller?: controllerFn;
}

export interface ClampFn {
  camera: PerspectiveCamera;
}

export interface ClampRtrn {
  clampCameraPosition: () => void;
}
