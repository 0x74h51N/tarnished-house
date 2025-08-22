import { BufferGeometry, Material, Mesh, Object3D } from "three";
import { InstancedMesh2 } from "@three.ez/instanced-mesh";
import type { CountOpts } from "@/loaders/types";
import { renderer } from "@/main";
import { findAllMeshes } from "./helpers";

export function getVariants({ manager, opts }: CountOpts) {
  const { group, baseMeshes } = manager;

  const sets: InstancedMesh2[] = (group.userData._sets ||= []);

  if (!sets.length) {
    for (let v = 0; v < baseMeshes.length; v++) {
      const subs = findAllMeshes(baseMeshes[v]);

      const geo = subs!.geometry as BufferGeometry;

      if (!geo) continue;

      const mat: Material[] = subs!.materials;

      const inst = new InstancedMesh2(geo, mat, {
        capacity: 1,
        createEntities: true,
        renderer,
      });

      inst.castShadow = opts.castShadow;
      inst.receiveShadow = opts.receiveShadow;

      group.add(inst);
      sets.push(inst);
    }
  }
  return { sets };
}
