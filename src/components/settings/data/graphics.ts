import config from "config.json";
import type { Light } from "three";
import { applyShadowSizeAndBias } from "@/engine/lights/utils";
import { fog } from "@/engine/postprocess/fog";
import type { MapSizeKey } from "@/types/global.types";
import { allMatUpdt, shadowDispose } from "@/utils";
import type { GeneralControl, GraphicsSettingsParams } from "../types";

export function makeGraphicsSettings({
  scene,
  lights,
  renderer,
  antialias,
  syncBloom,
  randomMeshes
}: GraphicsSettingsParams): GeneralControl[] {
  const rendererConf = config.scene.renderer;
  const shadowConfg = rendererConf.shadows;

  const lightArr: Light[] = [...lights.directLight.lights];
  lights.fireLight && lightArr.push(lights.fireLight.light);

  const defDist = shadowConfg.defMaxFar as keyof typeof shadowConfg.maxFar;
  const defLod = rendererConf.defLod as keyof typeof rendererConf.lods;

  return [
    {
      type: "checkbox",
      id: "antialiasing",
      label: "Antialiasing (will restart)",
      checked: antialias,
      onChange: (e) => {
        localStorage.setItem("antialias", String(e.target.checked));
        window.location.reload();
      }
    },
    {
      type: "checkbox",
      id: "bloomEnabled",
      label: "Bloom",
      checked: Boolean(config.scene.postProcessing.bloom.enabled),
      onChange: (e) => {
        config.scene.postProcessing.bloom.enabled = e.target.checked;
        syncBloom();
      }
    },
    {
      type: "checkbox",
      id: "fogToggle",
      label: "Fog Effect",
      checked: Boolean(config.scene.postProcessing.fog.enabled),
      onChange: (e) => {
        const v = e.target.checked;
        scene.fog = v ? fog : null;
      }
    },
    {
      type: "checkbox",
      id: "shadowEnabled",
      label: "Enable Shadows",
      checked: Boolean(shadowConfg.enabled),
      onChange: (e) => {
        const v = e.target.checked;
        shadowDispose(lightArr);
        lightArr.forEach((l) => {
          l.castShadow = v;
        });
        renderer.shadowMap.enabled = v;
        renderer.shadowMap.needsUpdate = true;
        allMatUpdt(scene);
      }
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
        lights.directLight.lights.forEach((l) => {
          l.visible = v;
          l.castShadow = v;
        });
      }
    },
    {
      type: "select",
      id: "lodOpts",
      label: "Level of Details",
      options: (
        Object.keys(rendererConf.lods) as Array<keyof typeof rendererConf.lods>
      ).map((k) => ({
        v: k,
        t: k,
        s: rendererConf.lods[k] === rendererConf.lods[defLod]
      })),
      onChange: (e) => {
        const k = e.target.value as keyof typeof rendererConf.lods;
        Object.values(randomMeshes).forEach((m) => {
          const dists = Object.values(rendererConf.lods[k]) as Array<number>;
          for (const inst of m.manager.sets) {
            if (inst.LODinfo?.render) {
              inst.updateAllLOD(dists);
              inst.updateAllShadowLOD(dists);
            }
          }
        });
      }
    },
    {
      type: "select",
      id: "shadowQuality",
      label: "Shadow Quality",
      options: (
        Object.keys(shadowConfg.maxFar) as Array<
          keyof typeof shadowConfg.maxFar
        >
      ).map((key) => ({
        v: key,
        t: key,
        s: shadowConfg.maxFar[key] === shadowConfg.maxFar[defDist]
      })),
      onChange: (e) => {
        const v = e.target.value;
        const o = shadowConfg.maxFar[v as keyof typeof shadowConfg.maxFar];
        const res = Object.keys(shadowConfg.mapSizes).find(
          (k) => shadowConfg.mapSizes[k as MapSizeKey].name === v
        );
        if (!o) return;
        shadowDispose(lightArr);
        lights.directLight.maxFar = o;

        applyShadowSizeAndBias(lightArr, Number(res), shadowConfg.mapSizes);

        lights.directLight.lights.forEach((l) => {
          l.shadow.needsUpdate = true;
        });
        lights.directLight.updateFrustums();

        allMatUpdt(scene);
        renderer.shadowMap.needsUpdate = true;
      }
    }
  ];
}
