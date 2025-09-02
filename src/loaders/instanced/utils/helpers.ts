import {
  type BufferGeometry,
  type Material,
  Mesh,
  type Object3D,
  type Object3DEventMap
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { rotationType } from "@/loaders";

/**
 * Calculates a rotation value in radians based on a fixed number or a min/max range.
 *
 * @param val – a number (fixed angle) or an object with `{ min, max }` range
 * @returns a single number: if `val` is a number, returns it; otherwise returns a random value between `min` and `max`
 */
export function getRotation(val?: rotationType): number {
  if (!val) return 0;
  if (typeof val === "number") {
    return val;
  }
  return Math.random() * (val.max - val.min) + val.min;
}

/**
 * Recenters a geometry on the XZ plane by moving its bounding-box center to the origin.
 *
 * @param geometry – the BufferGeometry whose bounding box will be computed and translated
 * @returns void
 */
export function centerGeometryXZ(geometry: BufferGeometry): void {
  geometry.computeBoundingBox();
  const box = geometry.boundingBox;
  if (!box) return;
  const offsetX = (box.max.x + box.min.x) / 2;
  const offsetZ = (box.max.z + box.min.z) / 2;
  geometry.translate(-offsetX, 0, -offsetZ);
}

/**
 * Traverses down a scene graph to find a nested Object3D at the given child‐index path.
 *
 * @param scene – root Object3D (e.g. `gltf.scene`)
 * @param depth – array of child indices, e.g. `[0, 2, 1]` to go `scene.children[0].children[2].children[1]`
 * @returns the targeted Object3D at the end of the path, or the original `scene` if `depth` is empty
 */
export function parentFinder(
  scene: Object3D<Object3DEventMap>,
  depth: number[]
): Object3D<Object3DEventMap> {
  let parentNode: Object3D<Object3DEventMap>;
  if (depth.length > 0) {
    parentNode = depth.reduce<Object3D<Object3DEventMap>>(
      (node, idx) => node.children[idx],
      scene
    );
  } else {
    parentNode = scene;
  }
  return parentNode;
}

export function findAllMeshes(
  node: Object3D | Mesh
): { geometry: BufferGeometry; materials: Material[] } | null {
  const meshes: Mesh<BufferGeometry, Material | Material[]>[] = [];
  node.traverse((c) => {
    if (c instanceof Mesh && c.geometry) meshes.push(c);
  });
  if (!meshes.length) return null;

  const mats: Material[] = [];

  for (const m of meshes) {
    if (Array.isArray(m.material)) {
      mats.push(m.material[0]);
    } else {
      mats.push(m.material);
    }
  }
  const geos = meshes.map((m) => {
    const g = m.geometry;
    return g;
  });

  const merged = mergeGeometries(geos, true);
  return { geometry: merged, materials: mats };
}
