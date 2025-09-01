import type { Flame, PointParticles } from "@/engine";
import type { PointLight, PointLightHelper, Vector3Like } from "three";

export type BonfireParticles = {
  flame: Flame;
  sparks: PointParticles;
  smoke: PointParticles;
};

export type BonfireOpts = {
  scale: number;
  position: Vector3Like;
  rotation: Vector3Like;
  castShadow: boolean;
  receiveShadow: boolean;
};

export type FireLight = {
  light: PointLight;
  helper: PointLightHelper;
  animator: { update: (elapsed: number) => void };
};
