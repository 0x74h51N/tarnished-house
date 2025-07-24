import { ManagerRefs } from "components/assetLoader";
import config from "../../config.json";

export function detectLowEnd() {
  const canvas = document.createElement("canvas");
  let isLowTex,
    isLowVertUni = false;
  const gl =
    canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  if (gl instanceof WebGLRenderingContext) {
    const maxTex = gl ? gl.getParameter(gl.MAX_TEXTURE_SIZE) : 8192;
    isLowTex = maxTex <= 2048;

    const maxVertUni = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS);
    isLowVertUni = maxVertUni < 256;
  }

  const ua = navigator.userAgent.toLowerCase();
  const isUAmobile =
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);
  const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const isSmall = window.innerWidth <= 648;
  const isMobileUI = isUAmobile || (hasTouch && isSmall);
  let isLowVendor = false;

  if (gl instanceof WebGLRenderingContext) {
    const dbg = gl.getExtension("WEBGL_debug_renderer_info");
    if (dbg) {
      const renderer = gl
        .getParameter(dbg.UNMASKED_RENDERER_WEBGL)
        .toLowerCase();
      const intelIntegrated = /(intel).*(hd graphics|iris xe?)/i.test(renderer);
      const maliOrAdreno = /(mali|adreno)/i.test(renderer);
      isLowVendor = intelIntegrated || maliOrAdreno;
    }
  }

  const isLowEnd = isMobileUI || isLowTex || isLowVertUni || isLowVendor;

  if (isLowEnd) {
    console.log("Low End Detected");
    const mobileConfig = config.performance.mobile;

    config.scene.renderer.maxPixelRatio = mobileConfig.maxPixelRatio;

    config.assets.particles[1].properties.maxCount! /=
      mobileConfig.particlesDivider;
    config.assets.particles[2].properties.maxCount! /=
      mobileConfig.particlesDivider;

    const orSpawn = config.assets.models.spawnable;
    Object.entries(orSpawn).forEach(([key, value]) => {
      const override =
        mobileConfig.spawnables[key as ManagerRefs["name"]] || {};

      orSpawn[key as ManagerRefs["name"]] = {
        ...value,
        ...override,
        spawn: {
          ...value.spawn,
          ...override.spawn,
        },
      };
    });

    const segmentsDivider = mobileConfig.floorGeometryDivider;
    config.assets.floor.geometry.widthSegments /= segmentsDivider;
    config.assets.floor.geometry.heightSegments /= segmentsDivider;

    config.scene.renderer.shadows.enabled = false;
  }
  return;
}
