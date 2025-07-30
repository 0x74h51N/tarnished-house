import { AudioListener, AudioLoader, PositionalAudio } from "three";
import config from "config.json";

export function createPositionalSound(
  listener: AudioListener,
  loader: AudioLoader
): { sound: PositionalAudio } {
  const sound = new PositionalAudio(listener);
  const audioConfig = config.scene.audio;
  loader.load(config.assets.sounds.fire, (buffer) => {
    sound.setBuffer(buffer);
    sound.setRefDistance(audioConfig.positionalAudio.refDistance);
    sound.setLoop(true);
    sound.setVolume(
      audioConfig.volume * audioConfig.positionalAudio.fireVolumeMultiplier
    );
  });
  return {
    sound,
  };
}
