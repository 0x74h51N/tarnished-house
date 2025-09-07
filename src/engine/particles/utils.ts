import type { BufferGeometry } from "three";

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
