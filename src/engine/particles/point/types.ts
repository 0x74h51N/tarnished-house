import type { Group, Object3DEventMap } from "three";
import type { minMax, Sizes } from "@/types/global.types";
import type { GetValue, NestedKeys } from "@/utils";
import type { BaseProps, Particles } from "../types";

export interface SparkProps {
  damping: number;
  stretchFact: number;
  elevDivs: minMax;
  waveFreq: number;
  waveAmp: number;
  speed: number;
}
export interface PointProps extends BaseProps {
  maxCount: number;
  spawnRate: number;
  area: number;
  scaleFactor: number;
  sizeGrowth?: number;
  fadeRate?: number;
  instant?: boolean;
  uTimeMult?: number;
}

export interface SparkOpts extends PointProps {
  sparkProps: SparkProps;
}

export interface SmokeOpts extends PointProps {
  opacity: number;
  textures: string;
}

export interface PointParticleInterface<
  T extends SmokeOpts | SparkOpts = SmokeOpts | SparkOpts
> {
  sizes: Sizes;
  props: T;
}

export type PointInterface = PointParticleInterface<SmokeOpts | SparkOpts>;

export type ParticleCmdKey = "reset";

export type PointUpdateKey =
  | ParticleCmdKey
  | Extract<NestedKeys<SmokeOpts> | NestedKeys<SparkOpts>, string>;

export type PointUpdateValue<K extends PointUpdateKey> = K extends "reset"
  ? boolean
  : K extends NestedKeys<SmokeOpts>
    ? GetValue<SmokeOpts, K>
    : K extends NestedKeys<SparkOpts>
      ? GetValue<SparkOpts, K>
      : never;

export type PointUpdateFn = <K extends PointUpdateKey>(
  key: K,
  value: PointUpdateValue<K>
) => void;

export interface PointParticles extends Particles {
  updtScreen: (pr: number) => void;
  update: PointUpdateFn;
  points: Group<Object3DEventMap>;
}

export const isSmoke = (p: SmokeOpts | SparkOpts): p is SmokeOpts =>
  "textures" in p;

export const isSpark = (p: SmokeOpts | SparkOpts): p is SparkOpts =>
  "sparkProps" in p;

export type PointHandlers = {
  [K in PointUpdateKey]?: (v: PointUpdateValue<K>) => void;
};
