import type {
  Object3D,
  Color,
  Texture,
  Matrix4Tuple,
  Vector3Like,
  Vector4Like,
} from "three";
import config from "../../../config.json";

export interface ElevationDividers {
  min: number;
  max: number;
}

export interface PointParticlesInterface {
  parent: Object3D;
  color?: Color | number | string;
  opacity?: number;
  maxCount?: number;
  spawnRate?: number;
  area: number;
  size: number;
  startPozs: Vector3Like;
  textures?: Texture[] | Texture | null;
  scaleFactor: number;
  sizeGrowth?: number;
  fadeRate?: number;
  sparks?: boolean;
  damping?: number;
  elevDivs?: ElevationDividers;
  speed?: number;
  stretchFact?: number;
}

export interface NoiseParams {
  noiseScale: Vector4Like;
  magnitude: number;
  lacunarity: number;
  gain: number;
  octaves: number;
}

interface MarchParams {
  iterations: number;
  rayStepFactor: number;
}

export interface FlameParticlesInterface {
  parent: Object3D;
  textures: Texture;
  startPozs: Vector3Like;
  size: number;
  speed: number;
  color?: string;
  seed?: number;
  noise: NoiseParams;
  march: MarchParams;
  colorMixStr: number;
}

type UpdateKey = keyof PointParticlesInterface | keyof FlameParticlesInterface;

type UpdateValue<K extends UpdateKey> = K extends keyof PointParticlesInterface
  ? PointParticlesInterface[K]
  : K extends keyof FlameParticlesInterface
  ? FlameParticlesInterface[K]
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

type ParticleConfig = (typeof config.assets.particles)[number];
export type ParticleName = ParticleConfig["name"];

export type ParticleSystemRefs = Record<ParticleName, CreateParticlesReturn>;
