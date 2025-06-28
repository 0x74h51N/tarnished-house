import {
  ACESFilmicToneMapping,
  BasicShadowMap,
  CineonToneMapping,
  FogExp2,
  LinearToneMapping,
  NoToneMapping,
  PCFShadowMap,
  PCFSoftShadowMap,
  ReinhardToneMapping,
  VSMShadowMap,
  WebGLRenderer,
} from "three";
import { params } from "../../../config.json";
import { GeneralControl } from "types";

export const fog = new FogExp2("#57767d", 0.02);

export const shadowMapSizes = [256, 512, 1024, 2048, 4096];
export const shadowDistOpt = [
  { n: "Half", w: 16, f: 20 },
  { n: "3/4", w: 30, f: 27 },
  { n: "Full", w: 40, f: 36 },
];
export const shadowTypes = {
  Basic: BasicShadowMap,
  PCF: PCFShadowMap,
  PCFSoft: PCFSoftShadowMap,
  VSM: VSMShadowMap,
};

// Mapping objesi
export const toneMappingMap = {
  NoToneMapping,
  LinearToneMapping,
  ReinhardToneMapping,
  CineonToneMapping,
  ACESFilmicToneMapping,
} as const;

// Select için seçenekler
const toneMappingOptions = [
  { v: "NoToneMapping", t: "None" },
  { v: "LinearToneMapping", t: "Linear" },
  { v: "ReinhardToneMapping", t: "Reinhard" },
  { v: "CineonToneMapping", t: "Cineon" },
  { v: "ACESFilmicToneMapping", t: "ACES" },
] as const;

export function makeControls(): GeneralControl[] {
  const initialVolume =
    typeof params.volume === "number" ? params.volume * 100 : 1;
  return [
    {
      type: "range",
      id: "volume",
      label: "Volume",
      min: 0,
      max: 100,
      step: 1,
      value: initialVolume,
      span: "volumeValue",
    },
    {
      type: "range",
      id: "brightness",
      label: "Brightness",
      min: 0,
      max: 2,
      step: 0.1,
      value: params.toneMappingExposure,
      span: "brightnessValue",
    },
  ];
}

export function makeGraphics(
  antialias: boolean,
  renderer: WebGLRenderer
): GeneralControl[] {
  return [
    {
      type: "checkbox",
      id: "fpsCounter",
      label: "Show FPS",
      checked: params.fpsCounter,
    },
    {
      type: "checkbox",
      id: "antialiasing",
      label: "Antialiasing",
      checked: antialias,
    },
    {
      type: "checkbox",
      id: "bloomEnabled",
      label: "Bloom",
      checked: params.bloomParams.enabled,
    },
    {
      type: "checkbox",
      id: "fogToggle",
      label: "Fog Effect",
      checked: params.fog,
    },
    {
      type: "checkbox",
      id: "shadowEnabled",
      label: "Enable Shadows",
      checked: renderer.shadowMap.enabled,
    },
    {
      type: "select",
      id: "shadowDistance",
      label: "Shadow Distance",
      options: shadowDistOpt.map((o) => ({
        v: o.n.toLowerCase(),
        t: o.n,
        s: params.shadowCameraWidth == o.w && params.shadowCameraFar == o.f,
      })),
    },
    {
      type: "select",
      id: "shadowResolution",
      label: "Shadow Resolution",
      options: shadowMapSizes.map((siz) => ({
        v: String(siz),
        t: String(siz),
        s: params.shadowMapSize == siz,
      })),
    },
    {
      type: "select",
      id: "shadowType",
      label: "Shadow Type",
      options: Object.entries(shadowTypes).map(([v, typeConst]) => ({
        v,
        t: v === "PCFSoft" ? "PCF Soft" : v,
        s: renderer.shadowMap.type === typeConst,
      })),
    },
    {
      type: "select",
      id: "quality",
      label: "Texture Quality",
      options: [
        { v: "low", t: "Low", s: false },
        { v: "medium", t: "Medium", s: false },
        { v: "high", t: "High", s: true },
      ],
    },
    {
      type: "select",
      id: "toneMapping",
      label: "Tone Mapping",
      options: toneMappingOptions.map((opt) => ({
        ...opt,
        s: renderer.toneMapping === toneMappingMap[opt.v],
      })),
    },
  ];
}

export function makeScene(): GeneralControl[] {
  return [
    {
      type: "range",
      id: "graveCount",
      label: "Grave Count",
      min: 1,
      max: 100,
      step: 1,
      value: params.graveCount,
      span: "graveCountValue",
    },
    {
      type: "range",
      id: "bushCount",
      label: "Bush Count",
      min: 1,
      max: 100,
      step: 1,
      value: params.bushCount,
      span: "bushCountValue",
    },
    {
      type: "range",
      id: "treeCount",
      label: "Tree Count",
      min: 1,
      max: 100,
      step: 1,
      value: params.treeCount,
      span: "treeCountValue",
    },
  ];
}
