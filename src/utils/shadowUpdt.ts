import { type Light, Mesh, type Object3D } from "three";

export function shadowDispose(lights: Light[]) {
  lights.forEach((light) => {
    if (light.shadow?.map) {
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
