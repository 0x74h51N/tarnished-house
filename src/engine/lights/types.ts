import { FireLight } from "@/prefabs";
import {
  AmbientLight,
  CameraHelper,
  DirectionalLight,
  DirectionalLightHelper,
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
