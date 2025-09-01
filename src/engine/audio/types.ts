import type {
  AudioListener,
  AudioLoader,
  PositionalAudio,
  Audio as ThreeAudio
} from "three";

export type PositionalOpts = {
  loop: boolean;
  volume: number;
  refDistance: number;
  rolloffFactor: number;
  autoplay: boolean;
};

export interface PositionalSoundArgs {
  url: string;
  opts: PositionalOpts;
}

export interface OneShotArgs {
  url: string;
  opts: PositionalOpts;
}

export interface AudioAPI {
  setVol(v: number): void;
  createPositional({
    url,
    opts
  }: PositionalSoundArgs): Promise<PositionalAudio>;
  createAmbience(url: string): ThreeAudio;
  resume(): Promise<void>;
}

export interface SoundCreator {
  loader: AudioLoader;
  listener: AudioListener;
}
