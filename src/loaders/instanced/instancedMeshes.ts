import type { CountOpts } from "../types";
import { createPositioner, getVariantsInstances } from "./utils";

export function spawnInstancedMesh({ manager, opts }: CountOpts) {
  if (!manager.baseMeshes?.length) return;

  const { sets } = getVariantsInstances({ manager, opts });

  manager.sets = sets;

  const tr = (manager.tr ||= []);

  const diff = opts.count - tr.length;
  if (diff === 0) return;

  const positioner = createPositioner(opts, 200, tr);

  if (diff > 0) {
    const addByV = new Array(sets.length).fill(0);
    for (let i = 0; i < diff; i++) addByV[(Math.random() * sets.length) | 0]++;

    for (let v = 0; v < sets.length; v++) {
      const m = addByV[v];
      if (!m) continue;

      sets[v].addInstances(m, (obj) => {
        const { pos, scl, quat } = positioner();
        tr.push({ pos: pos.clone(), v });
        obj.position.copy(pos);
        obj.scale.copy(scl);
        obj.quaternion.copy(quat);
      });
      if (sets[v].LODinfo?.render) {
        for (const lvl of sets[v].LODinfo.render.levels) {
          lvl.object.receiveShadow = sets[v].receiveShadow;
        }
      }
    }

    return;
  }

  // diff < 0
  const startIdx = tr.length + diff;
  const popsPerVariant = new Array(sets.length).fill(0);
  for (let i = startIdx; i < tr.length; i++) {
    const v = tr[i].v;
    if (v >= 0 && v < sets.length) popsPerVariant[v]++;
  }

  for (let v = 0; v < sets.length; v++) {
    const m = popsPerVariant[v];
    if (!m) continue;
    const count = sets[v].instancesCount ?? 0;
    if (count <= 0) continue;

    const take = Math.min(m, count);
    const ids: number[] = [];
    for (let j = 0; j < take; j++) ids.push(count - 1 - j);
    sets[v].removeInstances(...ids);
  }

  tr.splice(startIdx);
}
