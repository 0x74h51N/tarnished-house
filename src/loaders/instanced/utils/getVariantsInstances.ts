import { InstancedMesh2 } from "@three.ez/instanced-mesh";
import type { CountOpts } from "@/loaders/types";
import { renderer } from "@/main";
import { findAllMeshes } from "./helpers";
import config from "config.json";

export function getVariantsInstances({ manager, opts }: CountOpts) {
  const { sets, baseMeshes } = manager;

  if (!sets.length) {
    const rendererConf = config.scene.renderer;
    const lodDistancesCfg = Object.values(
      rendererConf.lods[rendererConf.defLod as keyof typeof rendererConf.lods]
    ) as number[];

    for (let v = 0; v < baseMeshes.length; v++) {
      const variantRoot = baseMeshes[v];

      const allLodNodes = variantRoot.children.length
        ? variantRoot.children.map((n) => findAllMeshes(n))
        : findAllMeshes(variantRoot);
      if (!allLodNodes) continue;

      const base = Array.isArray(allLodNodes) ? allLodNodes[0] : allLodNodes;

      const baseMats = base!.materials.map((m) => m.clone());
      const inst = new InstancedMesh2(base!.geometry, baseMats, {
        renderer,
      });

      inst.name = variantRoot.name || `variant_${v}`;

      if (Array.isArray(allLodNodes) && opts.lodsCount) {
        const maxK = Math.min(allLodNodes.length - 1, lodDistancesCfg.length);

        for (let k = 1; k <= maxK; k++) {
          const alt = allLodNodes[k];
          const dist = lodDistancesCfg[k - 1];

          const mat = alt!.materials.map((m) => m.clone());

          inst.addLOD(alt!.geometry, mat, dist);
          inst.addShadowLOD(alt!.geometry, dist);
        }
      }

      inst.computeBVH();
      inst.castShadow = opts.castShadow;
      inst.receiveShadow = opts.receiveShadow;

      sets[v] = inst;
    }
  }
  return { sets };
}
