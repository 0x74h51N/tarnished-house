import {
  Vector3,
  type Mesh,
  type Object3D,
  type Object3DEventMap,
} from "three";
import type { SpawnOptions } from "../types";

type Positioner = (mesh: Mesh) => void;

// Returns a reusable positioning function that spaces meshes in a radial pattern,
// avoiding overlap using a minimum distance threshold if provided.
export function createPositioner(
  opts: SpawnOptions,
  maxTry: number,
  existMeshes: Object3D<Object3DEventMap>[]
): Positioner {
  const placedPositions: [number, number][] = [];
  const tmp = new Vector3();

  for (const obj of existMeshes) {
    obj.getWorldPosition(tmp);
    placedPositions.push([tmp.x, tmp.z]);
  }

  const { radius, scale, minDistance, yPosition = 0 } = opts;
  const minD2 = minDistance * minDistance;
  const rMin2 = radius.min * radius.min;
  const rMax2 = radius.max * radius.max;

  return (mesh: Mesh) => {
    const nScale = scale.min + Math.random() * (scale.max - scale.min);

    mesh.scale.setScalar(nScale);

    mesh.position.set(0, 0, 0);

    let positionFound = false;
    let x = 0;
    let z = 0;
    let tryCount = 0;

    while (!positionFound && tryCount < maxTry) {
      const r2 = rMin2 + Math.random() * (rMax2 - rMin2);
      const r = Math.sqrt(r2);

      const theta = Math.random() * Math.PI * 2;

      x = Math.cos(theta) * r;
      z = Math.sin(theta) * r;

      if (minDistance > 0) {
        positionFound = placedPositions.every(([px, pz]) => {
          const dx = x - px,
            dz = z - pz;
          return dx * dx + dz * dz >= minD2;
        });
      } else {
        positionFound = true;
      }

      tryCount++;
    }

    mesh.position.set(x, yPosition, z);
    placedPositions.push([x, z]);
  };
}
