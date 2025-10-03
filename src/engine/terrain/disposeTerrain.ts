import type { InstancedMesh2 } from "@three.ez/instanced-mesh";

export function disposeTerrain(inst: InstancedMesh2) {
  try {
    inst.removeAllLODs();

    inst.parent?.remove(inst);

    inst.geometry?.dispose?.();

    if (Array.isArray(inst.material)) {
      for (const m of inst.material) m?.dispose?.();
    } else {
      inst.material?.dispose?.();
    }
  } catch {}
}
