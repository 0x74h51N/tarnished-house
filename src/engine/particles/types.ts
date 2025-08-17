import type { Color, Vector3Like } from "three";
import { Sizes } from "@/types/global.types";

export interface BaseProps {
  startPozs: Vector3Like;
  size: number;
  color: Color | number | string;
  seed?: number;
  uTimeMult?: number;
}

export interface BaseParticlesInterface<T> {
  sizes: Sizes;
  props: T;
}

export type Step = (delta: number) => void;

export interface Particles {
  step: Step;
}
