import type { Mesh, Vector4Like } from "three";
import type { GetValue, NestedKeys } from "@/utils";
import type { BaseProps, Particles } from "../types";

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
  texture: string;
}

export type FlameInterface = FlameProps;

export type FlameUpdateKey = Extract<NestedKeys<FlameProps>, string>;

export type FlameUpdateValue<K extends FlameUpdateKey> =
  K extends NestedKeys<FlameProps> ? GetValue<FlameProps, K> : never;

export type FlameUpdateFn = <K extends FlameUpdateKey>(
  key: K,
  value: FlameUpdateValue<K>
) => void;

export interface Flame extends Particles {
  flame: Mesh;
  update: FlameUpdateFn;
}

export type FlameHandlers = {
  [K in FlameUpdateKey]?: (v: FlameUpdateValue<K>) => void;
};
