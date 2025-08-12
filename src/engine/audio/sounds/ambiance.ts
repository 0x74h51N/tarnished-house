import { Audio as ThreeAudio } from "three";
import { SoundCreator } from "..";

export const createAmbianceSound = ({ listener, loader }: SoundCreator) => {
  return function createAmbience(url: string) {
    const s = new ThreeAudio(listener);
    loader.load(url, (buffer) => {
      s.setBuffer(buffer);
      s.setLoop(true);
      s.setVolume(1);
    });
    return s;
  };
};
