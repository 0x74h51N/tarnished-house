import { Euler, Quaternion } from "three";
import type { CountOpts } from "../types";
import { T } from "./types";
import {
  getVariants,
  createPositioner,
  getRotation,
  getLODVariants,
} from "./utils";

export function spawnInstancedMesh({ manager, opts }: CountOpts) {
  const { baseMeshes } = manager;
  if (!baseMeshes?.length) return;

  const { sets } = opts.lodsCount
    ? getLODVariants({ manager, opts })
    : getVariants({ manager, opts });

  const tr: T[] = (manager.group.userData._tr ||= []);
  const vr: number[] = (manager.group.userData._var ||= []);

  const diff = opts.count - tr.length;
  if (diff === 0) return;

  const positioner = createPositioner(opts, 200, tr);

  if (diff > 0) {
    for (let i = 0; i < diff; i++) {
      const quat = new Quaternion().setFromEuler(
        new Euler(
          getRotation(opts.rotation?.x) * Math.PI,
          getRotation(opts.rotation?.y) * Math.PI,
          getRotation(opts.rotation?.z) * Math.PI
        )
      );

      const { pos, scl } = positioner();
      const t: T = { pos, scl, quat };
      tr.push(t);

      const v = (Math.random() * baseMeshes.length) | 0;
      vr.push(v);

      const target = sets[v];
      if (!target) continue;
      const list = Array.isArray(target) ? target : [target];

      for (const inst of list) {
        inst.addInstances(1, (obj: any) => {
          obj.position.copy(t.pos);
          obj.scale.copy(t.scl);
          obj.quaternion.copy(t.quat);
        });
      }
    }
    return;
  }

  // diff < 0
  const startIdx = tr.length + diff;

  const popsPerVariant = new Array((sets as any).length).fill(0);
  for (let i = startIdx; i < tr.length; i++) popsPerVariant[vr[i]]++;

  for (let v = 0; v < (sets as any).length; v++) {
    const m = popsPerVariant[v];
    if (m <= 0) continue;

    const target = sets[v];
    if (!target) continue;
    const list = Array.isArray(target) ? target : [target];

    for (const im of list) {
      const count = im.instancesCount ?? 0;
      if (count <= 0) continue;

      const take = Math.min(m, count);
      const ids: number[] = [];
      for (let j = 0; j < take; j++) ids.push(count - 1 - j);
      im.removeInstances(...ids);
    }
  }

  tr.splice(diff);
  vr.splice(diff);
}
