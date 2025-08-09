import type { Mesh } from "three";
import type { SpawnOptions } from "../types";

type Positioner = (i: number, mesh: Mesh) => void;

// Returns a reusable positioning function that spaces meshes in a radial pattern,
// avoiding overlap using a minimum distance threshold if provided.
export function createPositioner(
  opts: SpawnOptions,
  maxTry: number
): Positioner {
  const placedPositions: [number, number][] = [];
  const { count, radius, scale, minDistance, yPosition = 0 } = opts;
  const nScale = scale.min + Math.random() * (scale.max - scale.min);

  return (i: number, mesh: Mesh) => {
    mesh.scale.setScalar(nScale);

    mesh.position.set(0, 0, 0);

    const angle = (i / count) * Math.PI * 2;
    let positionFound = false;
    let x = 0;
    let z = 0;
    let tryCount = 0;

    while (!positionFound && tryCount < maxTry) {
      const nRadius = radius.min + Math.random() * (radius.max - radius.min);
      x = Math.cos(angle) * nRadius;
      z = Math.sin(angle) * nRadius;

      if (minDistance > 0) {
        positionFound = placedPositions.every(([px, pz]) => {
          const dx = x - px;
          const dz = z - pz;
          return dx * dx + dz * dz >= minDistance * minDistance;
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
