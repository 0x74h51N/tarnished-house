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
import config from "../../../config.json";
import { GeneralControl, ToneMappingKey } from "types";

// Config Refs
const params = {
  volume: config.scene.audio.volume,
  toneMappingExposure: config.scene.renderer.toneMappingExposure,
  fpsCounter: config.scene.debug.fpsCounter,
  bloomParams: config.scene.postProcessing.bloom,
  fog: config.scene.postProcessing.fog.enabled,
  shadowMapSize: config.scene.renderer.shadows.mapSize,
  directionalLight: {
    shadowCameraWidth: config.scene.lighting.directional.shadow.camera.width,
    shadowCameraFar: config.scene.lighting.directional.shadow.camera.far,
  },
};
const assets = config.assets;
const fogSettings = config.scene.postProcessing.fog;
const shadowMapSizes = config.quality.shadowMapSizes;
const shadowDistOpt = config.quality.shadowDistance;
const toneMappingOptions = config.options.toneMappingTypes;

export const fog = new FogExp2(fogSettings.color, fogSettings.density);

export const shadowTypes = {
  Basic: BasicShadowMap,
  PCF: PCFShadowMap,
  PCFSoft: PCFSoftShadowMap,
  VSM: VSMShadowMap,
};
const toneMappingOpts = toneMappingOptions.map((opt) => ({
  v: opt.value as ToneMappingKey,
  t: opt.text,
}));

export const toneMappingMap = {
  NoToneMapping,
  LinearToneMapping,
  ReinhardToneMapping,
  CineonToneMapping,
  ACESFilmicToneMapping,
} as const;

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
        v: o.name.toLowerCase(),
        t: o.name,
        s:
          params.directionalLight.shadowCameraWidth == o.width &&
          params.directionalLight.shadowCameraFar == o.far,
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
        { v: "medium", t: "Medium", s: true },
        { v: "high", t: "High", s: false },
      ],
    },
    {
      type: "select",
      id: "toneMapping",
      label: "Tone Mapping",
      options: toneMappingOpts.map((opt) => ({
        ...opt,
        s: renderer.toneMapping === toneMappingMap[opt.v],
      })),
    },
  ];
}
const assetConfig = assets.models.spawnable;
export function makeScene(): GeneralControl[] {
  return (Object.keys(assetConfig) as Array<keyof typeof assetConfig>).map(
    (key) => {
      const keyStr = String(key);
      const label = keyStr.charAt(0).toUpperCase() + keyStr.slice(1);
      const id = `${keyStr}Count` as const;
      return {
        type: "range",
        id,
        label: `${label} Count`,
        min: 1,
        max: 100,
        step: 1,
        value: assetConfig[key].count,
        span: `${id}Value`,
      } as GeneralControl;
    }
  );
}
