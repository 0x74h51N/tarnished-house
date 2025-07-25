import type { Mesh } from "three";
import type { SpawnOptions } from "../types";

type PositionerOptions = SpawnOptions & {
  count: number;
  yPosition?: number;
};

type Positioner = (i: number, mesh: Mesh) => void;

// Returns a reusable positioning function that spaces meshes in a radial pattern,
// avoiding overlap using a minimum distance threshold if provided.
export function createPositioner(opts: PositionerOptions): Positioner {
  const placedPositions: [number, number][] = [];

  return (i: number, mesh: Mesh) => {
    const {
      radiusMin,
      radiusMax,
      scaleMin,
      scaleMax,
      minDistance = 0,
      yPosition = 0,
      count,
    } = opts;
    const scale = scaleMin + Math.random() * (scaleMax - scaleMin);

    mesh.scale.setScalar(scale);

    mesh.position.set(0, 0, 0);

    const angle = (i / count) * Math.PI * 2;
    let positionFound = false;
    let x = 0;
    let z = 0;
    let tryCount = 0;

    while (!positionFound && tryCount < 100) {
      const radius = radiusMin + Math.random() * (radiusMax - radiusMin);
      x = Math.cos(angle) * radius;
      z = Math.sin(angle) * radius;

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
