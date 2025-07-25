import { Mesh, Group } from "three";
import type { SpawnOptions } from "../types";
import { createPositioner } from "./positioner";

interface SpawnMeshesInterface {
  baseMeshes: Mesh[];
  group: Group;
  count: number;
  options: SpawnOptions;
  castShadow?: boolean;
  receiveShadow?: boolean;
  roots?: boolean;
}

export function spawnMeshes({
  group,
  baseMeshes,
  count,
  options,
  castShadow = true,
  receiveShadow = true,
  roots = false,
}: SpawnMeshesInterface & { baseMeshes: Mesh[] }) {
  const { scaleMin = 1, scaleMax = 1 } = options;

  // Dispose previous meshes in the group before spawn
  group.children.forEach((child) => {
    if (child instanceof Mesh) {
      child.geometry?.dispose();
      const mat = child.material;
      if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
      else mat.dispose();
    }
  });
  group.clear();

  const yPosition = roots ? 0 : 0.12;
  const positioner = createPositioner({ ...options, count, yPosition });

  // Randomly select and clone meshes from baseMeshes to the spawn count
  for (let i = 0; i < count; i++) {
    const base = baseMeshes[Math.floor(Math.random() * baseMeshes.length)];
    const mesh = base.clone(true);

    mesh.traverse((child) => {
      if (child instanceof Mesh) {
        const m = child;
        m.castShadow = castShadow;
        m.receiveShadow = receiveShadow;
      }
    });

    // Assign unique position and randomized scale to the mesh, according to spawn options
    positioner(i, mesh);

    group.add(mesh);
  }
}
