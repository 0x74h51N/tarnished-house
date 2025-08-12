import { PositionalAudio } from "three";
import { loadBuffer, PositionalSoundArgs, SoundCreator } from "../";

export const createPositionalSound = ({ loader, listener }: SoundCreator) => {
  return async function createPositional({ url, opts }: PositionalSoundArgs) {
    const buffer = await loadBuffer(url, loader);
    const s = new PositionalAudio(listener);
    s.setBuffer(buffer);
    s.setLoop(opts.loop);
    s.setRefDistance(opts.refDistance);
    s.setRolloffFactor(opts.rolloffFactor);
    s.setVolume(opts.volume);
    if (opts.autoplay) s.play();
    return s;
  };
};
