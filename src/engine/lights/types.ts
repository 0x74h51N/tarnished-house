import type { FireLight } from "@/prefabs";
import type {
  AmbientLight,
  CameraHelper,
  DirectionalLight,
  DirectionalLightHelper
} from "three";

export type DirectLight = {
  light: DirectionalLight;
  helper: DirectionalLightHelper;
  cameraHelper: CameraHelper;
};

export type LightBundle = {
  ambientLight: AmbientLight;
  fireLight?: FireLight;
  directLight: DirectLight;
};
