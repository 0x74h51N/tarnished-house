import type { PerspectiveCamera } from "three";
import type { FPSController } from "..";

export type PlayerOpts = {
  height: number;
  radius: number;
  camera: PerspectiveCamera;
  controller: FPSController;
  followRatio?: number;
};
