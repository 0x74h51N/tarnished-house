import type { Color, Vector3Like } from "three";
import { Sizes } from "@/types";

export interface BaseProps {
  startPozs: Vector3Like;
  size: number;
  speed?: number;
  color: Color | number | string;
  seed?: number;
}

export interface BaseParticlesInterface<T> {
  sizes: Sizes;
  props: T;
}

export type Step = (delta: number) => void;

export interface Particles {
  step: Step;
}
