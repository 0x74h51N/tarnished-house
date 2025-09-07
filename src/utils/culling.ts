import { Box3, type BufferGeometry, Sphere, type Vector3 } from "three";

export function setCullingSphere(
  geometry: BufferGeometry,
  center: Vector3,
  r: number
) {
  geometry.boundingSphere = geometry.boundingSphere ?? new Sphere();
  geometry.boundingSphere.center.copy(center);
  geometry.boundingSphere.radius = r;
}

export function setAABBfromDims(
  geometry: BufferGeometry,
  center: Vector3,
  rxz: number,
  height: number
) {
  const halfH = height * 0.5;
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
