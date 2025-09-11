import type {
  AmbientLight,
  CameraHelper,
  DirectionalLight,
  DirectionalLightHelper,
  PerspectiveCamera
} from "three";
import type { CSM } from "three/examples/jsm/Addons.js";
import type { FireLight } from "@/prefabs";
import type { ShadowUpdateGate } from "./shadowGate";

export type DirectLight = {
  light: DirectionalLight;
  helper: DirectionalLightHelper;
  cameraHelper: CameraHelper;
};

export type LightBundle = {
  ambientLight: AmbientLight;
  fireLight?: FireLight;
  csmLight: CSMLight;
  csmShadowGate: ShadowUpdateGate;
};

export type SyncToCam = (camera: PerspectiveCamera) => void;
export type CSMLight = {
  csm: CSM;
  syncToCam: SyncToCam;
};
