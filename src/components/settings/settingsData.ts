import {
  ACESFilmicToneMapping,
  BasicShadowMap,
  CineonToneMapping,
  DirectionalLight,
  LinearToneMapping,
  NoToneMapping,
  PCFShadowMap,
  PCFSoftShadowMap,
  ReinhardToneMapping,
  ToneMapping,
  VSMShadowMap,
} from "three";
import config from "config.json";
import {
  GeneralControl,
  GeneralSettingsParams,
  GraphicsSettingsParams,
  SceneSettingsParams,
} from "./types";
import { SpawnableName } from "../../loaders";
import { shadowDispose } from "../../utils";
import { spawnMeshes } from "@/loaders/utils";
import { fog } from "@/Systems/PostProcess/fog";

export const shadowTypes = {
  Basic: BasicShadowMap,
  PCF: PCFShadowMap,
  PCFSoft: PCFSoftShadowMap,
  VSM: VSMShadowMap,
};

export const toneMappingMap = {
  NoToneMapping,
  LinearToneMapping,
  ReinhardToneMapping,
  CineonToneMapping,
  ACESFilmicToneMapping,
} as const;

export function makeGeneralSettings({
  renderer,
  onVolumeChange,
}: GeneralSettingsParams): GeneralControl[] {
  const volumeVal =
    typeof config.scene.audio.volume === "number"
      ? config.scene.audio.volume * 100
      : 0;
  const toneVal = renderer.toneMappingExposure;

  return [
    {
      type: "range",
      id: "volume",
      label: "Volume",
      min: "0",
      max: "100",
      step: "1",
      value: volumeVal.toString(),
      span: "volumeValue",
      onChange: (e) => {
        const val = +e.target.value;
        document.getElementById("volumeValue")!.textContent = String(val);
        onVolumeChange(val / 100);
      },
    },
    {
      type: "range",
      id: "brightness",
      label: "Brightness",
      min: "0",
      max: "2",
      step: "0.1",
      value: toneVal.toString(),
      span: "brightnessValue",
      onChange: (e) => {
        const val = +e.target.value;
        document.getElementById("brightnessValue")!.textContent = String(val);
        renderer.toneMappingExposure = val;
      },
    },
  ];
}

export function makeGraphicsSettings({
  scene,
  lights,
  renderer,
  antialias,
  stats,
}: GraphicsSettingsParams): GeneralControl[] {
  const shadowConfg = config.scene.renderer.shadows;
  const lightArr = [lights.fireLight.light, lights.directLight.light];
  const defDist = shadowConfg.defDistance as keyof typeof shadowConfg.distance;
  return [
    {
      type: "checkbox",
      id: "fpsCounter",
      label: "Show FPS",
      checked: Boolean(config.scene.debug.fpsCounter),
      onChange: (e) => {
        if (e.target.checked) document.body.appendChild(stats.dom);
        else stats.dom.remove();
      },
    },
    {
      type: "checkbox",
      id: "antialiasing",
      label: "Antialiasing",
      checked: antialias,
      onChange: (e) => {
        localStorage.setItem("antialias", String(e.target.checked));
        window.location.reload();
      },
    },
    {
      type: "checkbox",
      id: "bloomEnabled",
      label: "Bloom",
      checked: Boolean(config.scene.postProcessing.bloom.enabled),
      onChange: (e) => {
        config.scene.postProcessing.bloom.enabled = e.target.checked;
      },
    },
    {
      type: "checkbox",
      id: "fogToggle",
      label: "Fog Effect",
      checked: Boolean(config.scene.postProcessing.fog.enabled),
      onChange: (e) => {
        const v = e.target.checked;
        scene.fog = v ? fog : null;
      },
    },
    {
      type: "checkbox",
      id: "shadowEnabled",
      label: "Enable Shadows",
      checked: Boolean(shadowConfg.enabled),
      onChange: (e) => {
        const v = e.target.checked;
        shadowDispose(lightArr);
        lightArr.forEach((l) => (l.castShadow = v));
        renderer.shadowMap.enabled = v;
        renderer.shadowMap.needsUpdate = true;
      },
    },
    {
      type: "checkbox",
      id: "directLightToggle",
      label: "Moon Light",
      checked: config.scene.lighting.directional.enabled,
      onChange: (e) => {
        const v = e.target.checked;
        config.scene.lighting.directional.enabled = v;
        shadowDispose(lightArr);
        lights.directLight.light.castShadow = v;
        v
          ? scene.add(lights.directLight.light)
          : scene.remove(lights.directLight.light);
      },
    },
    {
      type: "select",
      id: "shadowDistance",
      label: "Shadow Distance",
      options: (
        Object.keys(shadowConfg.distance) as Array<
          keyof typeof shadowConfg.distance
        >
      ).map((key) => ({
        v: key,
        t: shadowConfg.distance[key].name,
        s: shadowConfg.distance[key] === shadowConfg.distance[defDist],
      })),
      onChange: (e) => {
        const sel = e.target.value as keyof typeof shadowConfg.distance;
        const o = shadowConfg.distance[sel];
        if (!o) return;
        shadowDispose(lightArr);
        const dir = lightArr.find(
          (l) => l instanceof DirectionalLight
        ) as DirectionalLight;
        const half = o.width / 2;
        dir.shadow.camera.left = -half;
        dir.shadow.camera.right = half;
        dir.shadow.camera.far = o.far;
        dir.shadow.camera.updateProjectionMatrix();
        renderer.shadowMap.needsUpdate = true;
      },
    },
    {
      type: "select",
      id: "shadowResolution",
      label: "Shadow Resolution",
      options: shadowConfg.mapSizes.map((s) => ({
        v: s,
        t: String(s),
        s: shadowConfg.defMapSize === s,
      })),
      onChange: (e) => {
        const res = +e.target.value;
        shadowDispose(lightArr);
        lightArr.forEach((l) => l.shadow!.mapSize.set(res, res));
        renderer.shadowMap.needsUpdate = true;
      },
    },
    {
      type: "select",
      id: "shadowType",
      label: "Shadow Type",
      options: Object.entries(shadowTypes).map(([k]) => ({
        v: k,
        t: k,
        s:
          renderer.shadowMap.type ===
          shadowTypes[k as keyof typeof shadowTypes],
      })),
      onChange: (e) => {
        const key = e.target.value as keyof typeof shadowTypes;
        shadowDispose(lightArr);
        renderer.shadowMap.type = shadowTypes[key];
        renderer.shadowMap.needsUpdate = true;
      },
    },
    {
      type: "select",
      id: "toneMapping",
      label: "Tone Mapping",
      options: config.options.toneMappingTypes.map((o) => ({
        v: o.value,
        t: o.text,
        s:
          renderer.toneMapping ==
          toneMappingMap[o.value as keyof typeof toneMappingMap],
      })),
      onChange: (e) => {
        const value = e.target!.value as keyof typeof toneMappingMap;
        renderer.toneMapping = toneMappingMap[value] as ToneMapping;
      },
    },
  ];
}

export function makeSceneSettings({
  randomMeshes,
}: SceneSettingsParams): GeneralControl[] {
  const spawnable = config.assets.models.spawnable;
  const arr = [] as GeneralControl[];

  for (const k in spawnable) {
    const key = k as SpawnableName;
    const managerRef = randomMeshes[key];
    arr.push({
      type: "range",
      id: `${key}countId`,
      label: `${key} Count`,
      min: "1",
      max: "150",
      step: "1",
      value: spawnable[key].spawn.count.toString(),
      span: `${key}CountValue`,
      onChange: (e) => {
        const v = +e.target.value;
        document.getElementById(`${key}CountValue`)!.textContent = v.toString();
        spawnable[key].spawn.count = v;
        spawnMeshes(managerRef);
      },
    });
  }
  return arr;
}
