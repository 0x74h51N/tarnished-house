import { InstancedMesh2 } from "@three.ez/instanced-mesh";
import type { CountOpts } from "@/loaders/types";
import { renderer } from "@/main";
import { findAllMeshes } from "./helpers";
import config from "config.json";

export function getLODVariants({ manager, opts }: CountOpts) {
  const { sets, baseMeshes } = manager;

  if (!sets.length) {
    const lodDistancesCfg = Object.values(config.scene.lodDists) as number[];

    for (let v = 0; v < baseMeshes.length; v++) {
      const variantRoot = baseMeshes[v];
      const allLodNodes = variantRoot.children;

      const lodMerged = allLodNodes.map((n) => findAllMeshes(n));
      if (!lodMerged.length) continue;

      const base = lodMerged[0];
      const baseMats = base!.materials.map((m) => m.clone());
      const inst = new InstancedMesh2(base!.geometry, baseMats, {
        renderer,
      });

      inst.name = variantRoot.name || `variant_${v}`;

      const maxK = Math.min(lodMerged.length - 1, lodDistancesCfg.length);
      for (let k = 1; k <= maxK; k++) {
        const alt = lodMerged[k];
        const dist = lodDistancesCfg[k - 1];

        const mat = alt!.materials.map((m) => m.clone());

        inst.addLOD(alt!.geometry, mat, dist);
        inst.addShadowLOD(alt!.geometry, dist);
      }

      inst.computeBVH();
      inst.castShadow = opts.castShadow;
      inst.receiveShadow = opts.receiveShadow;

      sets[v] = inst;
    }
  }
  return { sets };
}
