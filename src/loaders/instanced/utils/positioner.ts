import { Euler, Quaternion, Vector3 } from "three";
import type { SpawnOpts } from "../../types";
import { getRotation } from "./helpers";

type positioner = () => { pos: Vector3; scl: Vector3; quat: Quaternion };

// Returns a reusable positioning function that spaces meshes in a radial pattern,
// avoiding overlap using a minimum distance threshold if provided.
export function createPositioner(
  opts: SpawnOpts,
  maxTry: number,
  tr: { pos: Vector3 }[]
): positioner {
  const { radius, scale, minDistance, yPosition = 0 } = opts;
  const minD2 = minDistance * minDistance;
  const rMin2 = radius.min * radius.min;
  const rMax2 = radius.max * radius.max;

  const tmpEuler = new Euler(0, 0, 0, "YXZ");
  const tmpQuat = new Quaternion();

  const placed: [number, number][] = tr.map((t) => [t.pos.x, t.pos.z]);

  const pos = new Vector3();
  const scl = new Vector3();

  return () => {
    const nScale = scale.min + Math.random() * (scale.max - scale.min);

    let x = 0,
      z = 0,
      tries = 0,
      ok = false;
    while (!ok && tries++ < maxTry) {
      const r2 = rMin2 + Math.random() * (rMax2 - rMin2);
      const r = Math.sqrt(r2);
      const theta = Math.random() * Math.PI * 2;
      x = Math.cos(theta) * r;
      z = Math.sin(theta) * r;

      ok =
        minDistance > 0
          ? placed.every(([px, pz]) => {
              const dx = x - px,
                dz = z - pz;
              return dx * dx + dz * dz >= minD2;
            })
          : true;
    }

    placed.push([x, z]);

    pos.set(x, yPosition, z);
    scl.setScalar(nScale);

    const rx = getRotation(opts.rotation?.x) * Math.PI;
    const ry = getRotation(opts.rotation?.y) * Math.PI;
    const rz = getRotation(opts.rotation?.z) * Math.PI;

    tmpEuler.set(rx, ry, rz, "YXZ");
    tmpQuat.setFromEuler(tmpEuler);

    return { pos, scl, quat: tmpQuat };
  };
}
