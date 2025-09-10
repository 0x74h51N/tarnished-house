import { MathUtils } from "three";
import { camCnfg } from ".";
import type { ClampFn, ClampRtrn } from "./controller/types";

export function createClamp({ camera }: ClampFn): ClampRtrn {
  const cnfg = camCnfg.controls;
  const limits = {
    minY: cnfg.positionLimits.y.min,
    maxY: cnfg.positionLimits.y.max,
    minX: cnfg.positionLimits.x.min,
    maxX: cnfg.positionLimits.x.max,
    minZ: cnfg.positionLimits.z.min,
    maxZ: cnfg.positionLimits.z.max
  };

  function clampAxis(axis: "x" | "y" | "z") {
    const min = limits[`min${axis.toUpperCase()}` as keyof typeof limits];
    const max = limits[`max${axis.toUpperCase()}` as keyof typeof limits];
    camera.position[axis] = MathUtils.lerp(
      camera.position[axis],
      MathUtils.clamp(camera.position[axis], min, max),
      cnfg.lerpFactor
    );
  }
  const clampCameraPosition = () => {
    (["x", "y", "z"] as const).forEach(clampAxis);
  };

  return { clampCameraPosition };
}
