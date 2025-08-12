import type { Group, Object3DEventMap, Texture } from "three";
import { NestedKeys, GetValue } from "@/utils";
import { minMax, Sizes } from "@/types";
import { BaseProps, Particles } from "../types";

export interface SparkProps {
  damping: number;
  stretchFact: number;
  elevDivs: minMax;
  waveFreq: number;
  waveAmp: number;
}
export interface PointProps extends BaseProps {
  maxCount: number;
  spawnRate: number;
  area: number;
  scaleFactor: number;
  sizeGrowth?: number;
  fadeRate?: number;
}

export interface SparkOpts extends PointProps {
  sparkProps: SparkProps;
}

export interface SmokeOpts extends PointProps {
  opacity: number;
  textures: string | string[];
}

export interface PointParticleInterface<
  T extends SmokeOpts | SparkOpts = SmokeOpts | SparkOpts
> {
  sizes: Sizes;
  props: T;
}

export type PointInterface = PointParticleInterface<SmokeOpts | SparkOpts>;

export type PointUpdateKey = Extract<
  NestedKeys<SmokeOpts> | NestedKeys<SparkOpts>,
  string
>;

export type PointUpdateValue<K extends PointUpdateKey> =
  K extends NestedKeys<SmokeOpts>
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
