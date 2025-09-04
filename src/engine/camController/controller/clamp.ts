import config from "config.json";
import { MathUtils } from "three";
import type { ClampFn, ClampRtrn } from "./types";

export function createClamp({ camera }: ClampFn): ClampRtrn {
  const controlsConfig = config.scene.camera.controls;
  const limits = {
    minY: controlsConfig.positionLimits.y.min,
    maxY: controlsConfig.positionLimits.y.max,
    minX: controlsConfig.positionLimits.x.min,
    maxX: controlsConfig.positionLimits.x.max,
    minZ: controlsConfig.positionLimits.z.min,
    maxZ: controlsConfig.positionLimits.z.max
  };

  function clampAxis(axis: "x" | "y" | "z") {
    const min = limits[`min${axis.toUpperCase()}` as keyof typeof limits];
    const max = limits[`max${axis.toUpperCase()}` as keyof typeof limits];
    camera.position[axis] = MathUtils.lerp(
      camera.position[axis],
      MathUtils.clamp(camera.position[axis], min, max),
      controlsConfig.lerpFactor
    );
  }
  const clampCameraPosition = () => {
    (["x", "y", "z"] as const).forEach(clampAxis);
  };

  return { clampCameraPosition };
}
