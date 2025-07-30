import {
  ACESFilmicToneMapping,
  BasicShadowMap,
  CineonToneMapping,
  LinearToneMapping,
  NoToneMapping,
  PCFShadowMap,
  PCFSoftShadowMap,
  ReinhardToneMapping,
  VSMShadowMap,
} from "three";
import { CreateSoundReturn } from "./engine/audio/types";

//
// Min max value slapper type
export type minMax = { min: number; max: number };

//
// Shadow types map
export const shadowTypes = {
  Basic: BasicShadowMap,
  PCF: PCFShadowMap,
  PCFSoft: PCFSoftShadowMap,
  VSM: VSMShadowMap,
} as const;

export type ShadowTypeMap = typeof shadowTypes;
export type ShadowTypeKey = keyof ShadowTypeMap;
export type ShadowTypeValue = ShadowTypeMap[ShadowTypeKey];

//
// ToneMapping types map
export const toneMappingMap = {
  NoToneMapping,
  LinearToneMapping,
  ReinhardToneMapping,
  CineonToneMapping,
  ACESFilmicToneMapping,
} as const;

export type ToneMappingMap = typeof toneMappingMap;
export type ToneMappingKey = keyof ToneMappingMap;
export type ToneMappingValue = ToneMappingMap[ToneMappingKey];

export type VolumeSetter = (v: number) => void;
export type IconUpdt = (v: number) => void;
export interface AudioBundle {
  setVolume: VolumeSetter;
  updateIcon: IconUpdt;
}
