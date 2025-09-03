import type {
  AmbientLight,
  CameraHelper,
  DirectionalLight,
  DirectionalLightHelper
} from "three";
import type { CSM } from "three/examples/jsm/Addons.js";
import type { FireLight } from "@/prefabs";

export type DirectLight = {
  light: DirectionalLight;
  helper: DirectionalLightHelper;
  cameraHelper: CameraHelper;
};

export type LightBundle = {
  ambientLight: AmbientLight;
  fireLight?: FireLight;
  directLight: CSM;
};
