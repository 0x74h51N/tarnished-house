import { Mesh, Group, Object3D } from "three";
import type { SpawnOptions } from "../types";

/**
 * Mesh multiplication and random placement utility function.
 * @param {Object3D[]} baseMeshes
 * @param {Group} group
 * @param {number} count
 * @param {object} options
 * @param {boolean} isGraveyard
 */

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
  const {
    scaleMin = 1,
    scaleMax = 1,
    radiusMin = 1,
    radiusMax = 1,
    minDistance = 0,
  } = options;
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
  const placedPositions = [];
  const yPosition = roots ? 0 : 0.12;

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

    const angle = (i / count) * Math.PI * 2;
    let positionFound = false;
    let x: number;
    let z: number;
    let tryCount = 0;
    while (!positionFound && tryCount < 100) {
      const radius = radiusMin + Math.random() * (radiusMax - radiusMin);
      x = Math.cos(angle) * radius;
      z = Math.sin(angle) * radius;
      if (minDistance > 0) {
        positionFound = placedPositions.every(([px, pz]) => {
          const dx = x - (px ?? 0);
          const dz = z - (pz ?? 0);
          return dx * dx + dz * dz >= minDistance * minDistance;
        });
      } else {
        positionFound = true;
      }
      tryCount++;
    }
    mesh.position.set(x!, yPosition, z!);
    placedPositions.push([x!, z!]);
    group.add(mesh);
  }
}
