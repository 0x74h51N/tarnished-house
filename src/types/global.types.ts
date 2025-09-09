import type config from "config.json";
import {
  ACESFilmicToneMapping,
  BasicShadowMap,
  CineonToneMapping,
  LinearToneMapping,
  type MeshStandardMaterial,
  NoToneMapping,
  PCFShadowMap,
  PCFSoftShadowMap,
  ReinhardToneMapping,
  type Texture,
  VSMShadowMap
} from "three";

//
// Min max value slapper type
export type minMax = { min: number; max: number };

//
// Shadow types map
export const shadowTypes = {
  Basic: BasicShadowMap,
  PCF: PCFShadowMap,
  PCFSoft: PCFSoftShadowMap,
  VSM: VSMShadowMap
} as const;

export type ShadowTypeMap = typeof shadowTypes;
export type ShadowTypeKey = keyof ShadowTypeMap;
export type ShadowTypeValue = ShadowTypeMap[ShadowTypeKey];

//
// ToneMapping types map
export const toneMappingMap = {
  None: NoToneMapping,
  Linear: LinearToneMapping,
  Reinhard: ReinhardToneMapping,
  Cineon: CineonToneMapping,
  "ACES Filmic": ACESFilmicToneMapping
} as const;

export type ToneMappingMap = typeof toneMappingMap;
export type ToneMappingKey = keyof ToneMappingMap;
export type ToneMappingValue = ToneMappingMap[ToneMappingKey];

export type VolumeSetter = (v: number) => void;
export type IconUpdt = (v: number) => void;
export interface AudioBundle {
  setVol: VolumeSetter;
  updtMuteIcon: IconUpdt;
}

//window size obj
export interface Sizes {
  width: number;
  height: number;
  pixelRatio: number;
  update: () => void;
}

export type MapSizes = typeof config.scene.renderer.shadows.mapSizes;

export type MapSizeKey = keyof MapSizes;

export type TextureKeys = {
  [K in keyof MeshStandardMaterial]: MeshStandardMaterial[K] extends
    | Texture
    | null
    | undefined
    ? K
    : never;
}[keyof MeshStandardMaterial];
