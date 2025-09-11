import { type Light, type Material, Mesh, type Object3D } from "three";
import type { CSM } from "three/examples/jsm/Addons.js";

export function shadowDispose(lights: Light[]) {
  lights.forEach((light) => {
    if (light.shadow) {
      const s = light.shadow;
      if (!s) return;
      if (s.map) {
        s.map.dispose();
        s.map = null;
      }
      if (s.mapPass) {
        s.mapPass.dispose();
        s.mapPass = null;
      }
    }
  });
}

export function allMatUpdt(root: Object3D) {
  root.traverse((o) => {
    if (o instanceof Mesh) {
      const m = o.material;
      if (!m) return;
      if (Array.isArray(m))
        m.forEach((mm) => {
          mm.needsUpdate = true;
        });
      else m.needsUpdate = true;
    }
  });
}

function collectMaterials(root: Object3D): Set<Material> {
  const out = new Set<Material>();

  root.traverse((obj) => {
    const mesh = obj as Mesh;

    const m = mesh.material as Material | Material[];
    if (Array.isArray(m))
      m.forEach((mat) => {
        mat && out.add(mat);
      });
    else if (m) out.add(m);
  });

  return out;
}

export function setMatsCSM(csm: CSM, root: Object3D) {
  csm.update();
  const mats = collectMaterials(root);
  mats.forEach((mat) => {
    const key = "__csmPatched";
    if (!(key in mat.userData)) {
      csm.setupMaterial(mat);
      mat.userData[key] = true;
      mat.needsUpdate = true;
    }
  });
}
