import {
  AmbientLight,
  CameraHelper,
  DirectionalLight,
  DirectionalLightHelper,
  PointLight,
  PointLightHelper,
} from "three";

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
