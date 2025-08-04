import { fog } from "@/engine/postprocess/fog";
import {
  ShadowTypeKey,
  shadowTypes,
  ToneMappingKey,
  toneMappingMap,
} from "@/types";
import { shadowDispose } from "@/utils";
import config from "config.json";
import { DirectionalLight } from "three";
import { GraphicsSettingsParams, GeneralControl } from "../types";

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
      label: "Antialiasing (will restart)",
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
        s: renderer.shadowMap.type === shadowTypes[k as ShadowTypeKey],
      })),
      onChange: (e) => {
        const v = e.target.value as ShadowTypeKey;
        shadowDispose(lightArr);
        renderer.shadowMap.type = shadowTypes[v];
        renderer.shadowMap.needsUpdate = true;
      },
    },
    {
      type: "select",
      id: "toneMapping",
      label: "Tone Mapping",
      options: Object.entries(toneMappingMap).map(([k]) => ({
        v: k,
        t: k,
        s: renderer.toneMapping == toneMappingMap[k as ToneMappingKey],
      })),
      onChange: (e) => {
        const v = e.target!.value as ToneMappingKey;
        renderer.toneMapping = toneMappingMap[v];
      },
    },
  ];
}
