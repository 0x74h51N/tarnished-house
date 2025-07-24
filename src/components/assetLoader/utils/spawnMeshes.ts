import { Mesh, Group, Object3D } from "three";
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
  count,
  options,
  castShadow = true,
  receiveShadow = true,
  roots = false,
}: SpawnMeshesInterface) {
  const { scaleMin = 1, scaleMax = 1 } = options;
  group.children.forEach((child) => {
    if ((child as Mesh).isMesh) {
      const mesh = child as Mesh;
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => {
            if (m && typeof m.dispose === "function") m.dispose();
          });
        } else {
          mesh.material.dispose();
        }
      }
    }
  });
  group.clear();
  group.clear();
  const yPosition = roots ? 0 : 0.12;

  const positioner = createPositioner({ ...options, count, yPosition });

  for (let i = 0; i < count; i++) {
    const base = (arguments[0] as SpawnMeshesInterface).baseMeshes[
      Math.floor(
        Math.random() * (arguments[0] as SpawnMeshesInterface).baseMeshes.length
      )
    ];
    const mesh = base.clone(true);

    if (i >= (arguments[0] as SpawnMeshesInterface).baseMeshes.length) {
      mesh.traverse((child: Object3D) => {
        if ((child as Mesh).isMesh) {
          if (roots) child.rotateY(Math.random() * Math.PI);
          const meshChild = child as Mesh;
          meshChild.castShadow = castShadow;
          meshChild.receiveShadow = receiveShadow;
          if (meshChild.material) {
            if (Array.isArray(meshChild.material)) {
              meshChild.material = meshChild.material.map((m) => m.clone());
            } else {
              meshChild.material = meshChild.material.clone();
            }
          }
        }
      });
    } else {
      mesh.traverse((child: Object3D) => {
        if ((child as Mesh).isMesh) {
          const meshChild = child as Mesh;
          meshChild.castShadow = castShadow;
          meshChild.receiveShadow = receiveShadow;
        }
      });
    }

    const scale = scaleMin + Math.random() * (scaleMax - scaleMin);
    mesh.scale.setScalar(scale);
    mesh.position.set(0, 0, 0);

    positioner(i, mesh);
    group.add(mesh);
  }
}
