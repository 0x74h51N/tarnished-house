import { Material, Sphere, Vector3 } from "three";
import { InstancedMesh2 } from "@three.ez/instanced-mesh";
import type { CountOpts } from "@/loaders/types";
import { renderer } from "@/main";
import { findAllMeshes } from "./helpers";
import config from "config.json";

export function getLODVariants({ manager, opts }: CountOpts) {
  const { group, baseMeshes } = manager;

  const sets: InstancedMesh2[][] = (group.userData._sets ||= []);
  if (!sets.length) {
    const lodCountCfg = opts.lodsCount ?? 0;
    const lodDistancesCfg = Object.values(config.scene.lodDists) as number[];

    const scaleMax = opts.scale.max;
    const spawnR = opts.radius.max;
    const pad = 2;

    for (let v = 0; v < baseMeshes.length; v++) {
      const variantRoot = baseMeshes[v];

      const allLodNodes = variantRoot.children;

      const lodSubMeshes = allLodNodes.map((n) => findAllMeshes(n));

      const baseSubs = lodSubMeshes[0];
      sets[v] = [];

      for (let i = 0; i < baseSubs.length; i++) {
        const src0 = baseSubs[i];
        const geo0 = src0.geometry;
        if (!geo0) continue;

        const mat0: Material = Array.isArray(src0.material)
          ? src0.material[0]
          : src0.material;

        // LOD0
        if (!geo0.boundingSphere) geo0.computeBoundingSphere?.();
        const baseR0 = geo0.boundingSphere?.radius ?? 1;
        geo0.boundingSphere = new Sphere(
          new Vector3(0, 0, 0),
          baseR0 * scaleMax + spawnR + pad
        );
        const inst = new InstancedMesh2(geo0, mat0, {
          capacity: 1,
          createEntities: true,
          renderer,
        });
        inst.name = src0.name;

        for (let k = 1; k < Math.min(lodCountCfg, lodSubMeshes.length); k++) {
          const alt = lodSubMeshes[k][i];
          if (!alt?.geometry) continue;
          const dist = lodDistancesCfg[k - 1] ?? lodDistancesCfg.at(-1)!;
          inst.addLOD(alt.geometry, mat0, dist);
          inst.addShadowLOD(alt.geometry, dist);
        }

        // inst.computeBVH();
        inst.castShadow = opts.castShadow;
        inst.receiveShadow = opts.receiveShadow;
        group.add(inst);
        sets[v].push(inst);
      }
    }
  }
  return { sets };
}
