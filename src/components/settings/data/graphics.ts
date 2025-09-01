import config from "config.json";
import { DirectionalLight, type Light } from "three";
import { applyShadowSizeAndBias } from "@/engine/lights/utils";
import { fog } from "@/engine/postprocess/fog";
import { type ShadowTypeKey, shadowTypes } from "@/types/global.types";
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

  const lightArr: Light[] = [lights.directLight.light];
  lights.fireLight && lightArr.push(lights.fireLight.light);

  const defDist = shadowConfg.defDistance as keyof typeof shadowConfg.distance;
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
        lights.directLight.light.castShadow = v;
        v
          ? scene.add(lights.directLight.light)
          : scene.remove(lights.directLight.light);
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
      id: "shadowDistance",
      label: "Shadow Distance",
      options: (
        Object.keys(shadowConfg.distance) as Array<
          keyof typeof shadowConfg.distance
        >
      ).map((key) => ({
        v: key,
        t: key,
        s: shadowConfg.distance[key] === shadowConfg.distance[defDist]
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
        const halfH = o.height / 2;
        dir.shadow.camera.left = -half;
        dir.shadow.camera.right = half;
        dir.shadow.camera.bottom = -halfH;
        dir.shadow.camera.top = halfH;
        dir.shadow.camera.far = o.far;
        dir.shadow.camera.updateProjectionMatrix();
        renderer.shadowMap.needsUpdate = true;
      }
    },
    {
      type: "select",
      id: "shadowResolution",
      label: "Shadow Resolution",
      options: (
        Object.keys(shadowConfg.mapSizes) as Array<
          keyof typeof shadowConfg.mapSizes
        >
      ).map((size) => ({
        v: Number(size),
        t: shadowConfg.mapSizes[size].name,
        s: shadowConfg.defMapSize === Number(size)
      })),
      onChange: (e) => {
        const res = +e.target.value;
        shadowDispose(lightArr);
        applyShadowSizeAndBias(lights, Number(res), shadowConfg.mapSizes);
        renderer.shadowMap.needsUpdate = true;
      }
    },
    {
      type: "select",
      id: "shadowType",
      label: "Shadow Type",
      options: Object.entries(shadowTypes).map(([k]) => ({
        v: k,
        t: k,
        s: renderer.shadowMap.type === shadowTypes[k as ShadowTypeKey]
      })),
      onChange: (e) => {
        const v = e.target.value as ShadowTypeKey;
        shadowDispose(lightArr);
        renderer.shadowMap.type = shadowTypes[v];
        renderer.shadowMap.needsUpdate = true;
        allMatUpdt(scene);
      }
    }
  ];
}
