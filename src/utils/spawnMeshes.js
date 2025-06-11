import * as THREE from "three";

/**
 * Mesh multiplication and random placement utility function.
 * @param {THREE.Object3D[]} baseMeshes
 * @param {THREE.Group} group
 * @param {number} count
 * @param {object} options
 * @param {boolean} isGraveyard
 */
export function spawnMeshes(
  baseMeshes,
  group,
  count,
  options = {},
  isGraveyard = false
) {
  const {
    scaleMin = 1,
    scaleMax = 1,
    radiusMin = 1,
    radiusMax = 1,
    minDistance = 0,
  } = options;
  group.children.forEach((child) => {
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach((m) => m.dispose());
      } else {
        child.material.dispose();
      }
    }
  });
  group.clear();
  group.clear();
  const placedPositions = [];
  const yPosition = isGraveyard ? 0.25 : 0.1;

  for (let i = 0; i < count; i++) {
    const base = baseMeshes[Math.floor(Math.random() * baseMeshes.length)];
    const mesh = base.clone(true);

    if (i >= baseMeshes.length) {
      mesh.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.material) {
            child.material = child.material.clone();
          }
        }
      });
    } else {
      mesh.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }

    const scale = scaleMin + Math.random() * (scaleMax - scaleMin);
    mesh.scale.setScalar(scale);
    mesh.position.set(0, 0, 0);

    let positionFound = false;
    let x, z;
    let tryCount = 0;
    while (!positionFound && tryCount < 100) {
      const angle = (i / count) * Math.PI * 2;
      const radius = radiusMin + Math.random() * (radiusMax - radiusMin);
      x = Math.cos(angle) * radius;
      z = Math.sin(angle) * radius;
      if (minDistance > 0) {
        positionFound = placedPositions.every(([px, pz]) => {
          const dx = x - px;
          const dz = z - pz;
          return Math.sqrt(dx * dx + dz * dz) >= minDistance;
        });
      } else {
        positionFound = true;
      }
      tryCount++;
    }
    mesh.position.set(x, yPosition, z);
    placedPositions.push([x, z]);
    group.add(mesh);
  }
}
