import config from "config.json";
import type { Light } from "three";
import { camCnfg } from "@/engine";
import { applyShadowSizeAndBias } from "@/engine/lights/utils";
import { fog } from "@/engine/postprocess/fog";
import type { QualityKeys } from "@/types/global.types";
import { allMatUpdt, shadowDispose } from "@/utils";
import type { GeneralControl, GraphicsSettingsParams } from "../types";
import { applySceneAniso } from "../utils";

export function makeGraphicsSettings({
  scene,
  lights,
  renderer,
  antialias,
  syncBloom,
  randomMeshes,
  CamController
}: GraphicsSettingsParams): GeneralControl[] {
  const rendererConf = config.scene.renderer;
  const shadowConfg = rendererConf.shadows;
  const postProcessCnf = config.scene.postProcessing;

  const lightArr: Light[] = [...lights.csmLight.csm.lights];
  lights.fireLight && lightArr.push(lights.fireLight.light);

  const defMApSize = shadowConfg.defMapSize as QualityKeys;
  const defLod = rendererConf.defLod as QualityKeys;

  // Anisoptic Filter
  const anisoCap = renderer.capabilities.getMaxAnisotropy();
  const anisotropyFilters: number[] = [];
  for (let v = anisoCap; v > 1; v >>= 1) anisotropyFilters.push(v);

  let currentAniso = anisoCap / 2;

  return [
    {
      type: "checkbox",
      id: "antialiasing",
      label: "Antialiasing",
      tooltip: "Will restart",
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
        lights.csmLight.syncToCam(CamController.camera);
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
        lights.csmLight.csm.lights.forEach((l) => {
          l.visible = v;
          l.castShadow = v;
        });
      }
    },
    {
      type: "select",
      id: "viewDistance",
      label: "View Distance",
      tooltip: "Camera View Distance",
      options: (Object.keys(camCnfg.camFar) as Array<QualityKeys>).map((k) => ({
        v: k,
        t: k,
        s: camCnfg.camFar[k] === camCnfg.camFar[camCnfg.defFar as QualityKeys]
      })),
      onChange: (e) => {
        const k = e.target.value as QualityKeys;
        const far = camCnfg.camFar[k];
        CamController.camera.far = far;
        CamController.camera.updateProjectionMatrix();
        CamController.camera.updateMatrixWorld();
        if (scene.fog) fog.far = far * postProcessCnf.fog.farRatio;
        lights.csmLight.syncToCam(CamController.camera);
      }
    },
    {
      type: "select",
      id: "lodOpts",
      label: "Level of Details",
      options: (Object.keys(rendererConf.lods) as Array<QualityKeys>).map(
        (k) => ({
          v: k,
          t: k,
          s: rendererConf.lods[k] === rendererConf.lods[defLod]
        })
      ),
      onChange: (e) => {
        const k = e.target.value as QualityKeys;
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
      options: (Object.keys(shadowConfg.mapSizes) as Array<QualityKeys>).map(
        (key) => ({
          v: key,
          t: key,
          s: shadowConfg.mapSizes[key] === shadowConfg.mapSizes[defMApSize]
        })
      ),
      onChange: (e) => {
        const k = e.target.value as QualityKeys;

        shadowDispose(lightArr);
        applyShadowSizeAndBias(lightArr, k, shadowConfg.mapSizes);

        lights.csmLight.csm.lights.forEach((l) => {
          l.shadow.needsUpdate = true;
        });
        lights.csmLight.csm.updateFrustums();

        allMatUpdt(scene);
        renderer.shadowMap.needsUpdate = true;
      }
    },
    {
      type: "select",
      id: "antisotropyFilter",
      label: "Ansotropic Filt.",
      tooltip: "Textures Ansotropic Filtering",
      options: anisotropyFilters.map((v) => ({
        v: v.toString(),
        t: `X${v}`,
        s: v === currentAniso
      })),
      onChange: (e) => {
        const value = Number(e.target.value);
        currentAniso = value;
        applySceneAniso(scene, value);
        renderer.shadowMap.needsUpdate = true;
      }
    }
  ];
}
