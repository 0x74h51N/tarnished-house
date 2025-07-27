import type { Color, Object3D, Texture, Vector3Like, Vector4Like } from "three";
import config from "config.json";

export interface BaseProps {
  startPozs: Vector3Like;
  size: number;
  speed?: number;
  color: Color | number | string;
  seed?: number;
}
export interface ElevationDividers {
  min: number;
  max: number;
}
export interface PointProps extends BaseProps {
  opacity?: number;
  maxCount: number;
  spawnRate: number;
  area: number;
  scaleFactor: number;
  sizeGrowth?: number;
  fadeRate?: number;
  sparks?: boolean;
  damping?: number;
  elevDivs?: ElevationDividers;
  stretchFact?: number;
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

export interface PointParticlesInterface {
  parent: Object3D;
  textures?: Texture | Texture[];
  props: PointProps;
}

export interface FlameParticlesInterface {
  parent: Object3D;
  textures?: Texture;
  props: FlameProps;
}

export type UpdateKey = keyof PointProps | keyof FlameProps;

export type UpdateValue<K extends UpdateKey> = K extends keyof PointProps
  ? PointProps[K]
  : K extends keyof FlameProps
  ? FlameProps[K]
  : never;

export type UpdateFn = <K extends UpdateKey>(
  key: K,
  value: UpdateValue<K>
) => void;

export type Step = (delta: number) => void;

export interface CreateParticlesReturn {
  step: Step;
  updtScreen: () => void;
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
