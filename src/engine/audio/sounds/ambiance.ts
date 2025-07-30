import { AudioListener, AudioLoader, Audio } from "three";
import config from "config.json";

export function createAmbianceSound(
  listener: AudioListener,
  loader: AudioLoader
): { sound: Audio } {
  const sound = new Audio(listener);

  loader.load(config.assets.sounds.ambiance, (buffer) => {
    sound.setBuffer(buffer);
    sound.setLoop(true);
    sound.setVolume(config.scene.audio.volume);
  });

  return {
    sound,
  };
}
