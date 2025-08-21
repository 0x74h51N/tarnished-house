import { BufferGeometry, Material, Mesh, Object3D } from "three";
import { InstancedMesh2 } from "@three.ez/instanced-mesh";
import type { CountOpts } from "@/loaders/types";
import { T } from "../types";
import { renderer } from "@/main";

export function getVariants({ manager, opts }: CountOpts) {
  const { group, baseMeshes } = manager;

  const tr: T[] = (group.userData._tr ||= []);
  const vr: number[] = (group.userData._var ||= []);
  const sets: InstancedMesh2[][] = (group.userData._sets ||= []);

  if (!sets.length) {
    for (let v = 0; v < baseMeshes.length; v++) {
      const subs = findAllMeshes(baseMeshes[v]);
      sets[v] = [];

      for (const src of subs) {
        const geo = src.geometry as BufferGeometry;

        if (!geo) continue;

        const mat: Material = Array.isArray(src.material)
          ? src.material[0]
          : src.material;

        const inst = new InstancedMesh2(geo, mat, {
          capacity: 1,
          renderer,
        });

        inst.castShadow = opts.castShadow;
        inst.receiveShadow = opts.receiveShadow;

        group.add(inst);
        sets[v].push(inst);
      }
    }
  }
  return { tr, vr, sets };
}

function findAllMeshes(node: Object3D): Mesh<BufferGeometry, Material>[] {
  const out: Mesh<BufferGeometry, Material>[] = [];
  if (node instanceof Mesh) out.push(node as Mesh<BufferGeometry, Material>);
  node.traverse((c) => {
    if (c instanceof Mesh) out.push(c as Mesh<BufferGeometry, Material>);
  });
  return out;
}
