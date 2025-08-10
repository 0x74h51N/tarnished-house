import {
  AmbientLight,
  CameraHelper,
  DirectionalLight,
  DirectionalLightHelper,
  PointLight,
  PointLightHelper,
} from "three";
import config from "config.json";

export type FireLight = {
  light: PointLight;
  helper: PointLightHelper;
  animator: { update: (elapsed: number) => void };
};

export type DirectLight = {
  light: DirectionalLight;
  helper: DirectionalLightHelper;
  cameraHelper: CameraHelper;
};

export type LightBundle = {
  ambientLight: AmbientLight;
  fireLight: FireLight;
  directLight: DirectLight;
};
export type MapSizes = typeof config.scene.renderer.shadows.mapSizes;

export type MapSizeKey = keyof MapSizes;
