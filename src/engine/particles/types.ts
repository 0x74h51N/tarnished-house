import type { Color, Object3D, Texture, Vector3Like, Vector4Like } from "three";
import config from "config.json";
import { NestedKeys, GetValue } from "@/utils";
import { minMax, Sizes } from "@/types";

export interface BaseProps {
  startPozs: Vector3Like;
  size: number;
  speed?: number;
  color: Color | number | string;
  seed?: number;
}

export interface SparkProps {
  damping: number;
  stretchFact: number;
  elevDivs: minMax;
  waveFreq: number;
  waveAmp: number;
}
export interface PointProps extends BaseProps {
  opacity?: number;
  maxCount: number;
  spawnRate: number;
  area: number;
  scaleFactor: number;
  sizeGrowth?: number;
  fadeRate?: number;
  sparkProps: SparkProps;
}

export interface NoiseParams {
  noiseScale: Vector4Like;
  magnitude: number;
  lacunarity: number;
  gain: number;
  octaves: number;
}

export interface MarchParams {
  iterations: number;
  rayStepFactor: number;
}

export interface FlameProps extends BaseProps {
  noise: NoiseParams;
  march: MarchParams;
  colorMixStr: number;
}

export type ParticlesInterface = PointProps | FlameProps;

export interface BaseParticlesInterface<
  T extends ParticlesInterface = ParticlesInterface
> {
  sizes: Sizes;
  parent: Object3D;
  textures?: Texture | Texture[];
  props: T;
}

export type PointParticlesInterface = BaseParticlesInterface<PointProps>;
export type FlameParticlesInterface = BaseParticlesInterface<FlameProps>;

export type UpdateKey = Extract<
  NestedKeys<FlameProps> | NestedKeys<PointProps>,
  string
>;

export type UpdateValue<K extends UpdateKey> = K extends NestedKeys<FlameProps>
  ? GetValue<FlameProps, K>
  : K extends NestedKeys<PointProps>
  ? GetValue<PointProps, K>
  : never;

export type UpdateFn = <K extends UpdateKey>(
  key: K,
  value: UpdateValue<K>
) => void;

export type Step = (delta: number) => void;

export interface CreateParticlesReturn {
  step: Step;
  updtScreen?: (pr: number) => void;
  update: UpdateFn;
}
export type ParticleConfg = {
  textures?: string[] | string | null;
  properties: ParticlesInterface;
};
export type ParticleConfigs = Record<
  keyof typeof config.assets.particles,
  ParticleConfg
>;
export type ParticleName = keyof ParticleConfigs;
export type ParticleSystemRefs = Record<ParticleName, CreateParticlesReturn>;
