import { Mesh } from "three";
import type { CountOpts } from "../types";
import { createPositioner } from "./positioner";
import { centerGeometryXZ, getRotation } from "./helpers";

export function spawnMeshes({ manager, opts }: CountOpts) {
  const { group, baseMeshes } = manager;
  const diff = opts.count - group.children.length;

  if (diff < 0) {
    const disp = group.children.slice(diff);

    disp.forEach((child) => {
      if (child instanceof Mesh) {
        child.geometry?.dispose();
        const mat = child.material;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else mat.dispose();
      }
      group.remove(child);
    });
  }
  const existMeshes = group.children;

  if (diff > 0) {
    const positioner = createPositioner(opts, 200, existMeshes);

    // Randomly select and clone meshes from baseMeshes to the spawn count
    for (let i = 0; i < diff; i++) {
      const base = baseMeshes[Math.floor(Math.random() * baseMeshes.length)];
      const mesh = base.clone(true);

      mesh.traverse((child) => {
        if (child instanceof Mesh) {
          child.castShadow = opts.castShadow;
          child.receiveShadow = opts.receiveShadow;

          opts.getGeoCenterXZ && centerGeometryXZ(child.geometry);
        }
      });

      // Assign unique position and randomized scale to the mesh, according to spawn options
      positioner(mesh);

      //Rotation
      const [x, y, z] = (["x", "y", "z"] as const).map(
        (a) => getRotation(opts.rotation?.[a]) * Math.PI
      );
      mesh.rotation.set(x, y, z);

      group.add(mesh);
    }
  }
}
