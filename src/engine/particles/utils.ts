import { Box3, type BufferGeometry, Sphere, type Vector3 } from "three";

export function stripUnusedAttrs(
  geometry: BufferGeometry,
  keep?: readonly string[]
) {
  const keepSet = new Set(keep);
  keepSet.add("position");
  for (const name of Object.keys(geometry.attributes)) {
    if (!keepSet.has(name)) {
      geometry.deleteAttribute(name);
      console.log("name ", name, " attribute deleted");
    }
  }
  return geometry;
}

export function cullingBounds(
  geometry: BufferGeometry,
  center: Vector3,
  rxz: number,
  height: number
) {
  const halfH = height * 0.5;
  const r = Math.sqrt(rxz * rxz + halfH * halfH);

  geometry.boundingSphere = geometry.boundingSphere ?? new Sphere();
  geometry.boundingSphere.center.copy(center);
  geometry.boundingSphere.radius = r;

  geometry.boundingBox = geometry.boundingBox ?? new Box3();
  geometry.boundingBox.min.set(
    center.x - rxz,
    center.y - halfH,
    center.z - rxz
  );
  geometry.boundingBox.max.set(
    center.x + rxz,
    center.y + halfH,
    center.z + rxz
  );
}
