import type { Light } from "three";

export function shadowDispose(lights: Light[]) {
  lights.forEach((light) => {
    if (light.shadow && light.shadow.map) {
      light.shadow.map.dispose();
      light.shadow.map = null;
    }
  });
}
