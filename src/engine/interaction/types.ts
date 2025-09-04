import type { Camera, Object3D } from "three";

export type RayNdcFromEvent = {
  pointerEvent: PointerEvent;
  canvas: HTMLCanvasElement;
};

export type RayHitTestParams = {
  camera: Camera;
  target: Object3D;
  recursive?: boolean;
};

export type RayCast = {
  setNdcFromEvent: (p: RayNdcFromEvent) => void;
  hitTest: (p: RayHitTestParams) => boolean;
};

export type CenterDot = {
  el: HTMLDivElement;
  show: () => void;
  hide: () => void;
  destroy: () => void;
  rayCast: RayCast;
};
