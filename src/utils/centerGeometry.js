export function centerGeometryXZ(geometry) {
  geometry.computeBoundingBox();
  const box = geometry.boundingBox;
  const offsetX = (box.max.x + box.min.x) / 2;
  const offsetZ = (box.max.z + box.min.z) / 2;
  geometry.translate(-offsetX, 0, -offsetZ);
}
