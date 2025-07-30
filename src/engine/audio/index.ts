import { AudioListener, AudioLoader } from "three";
import config from "config.json";
import { CreateSoundInterface, CreateSoundReturn } from "./types";
import { createPositionalSound } from "./sounds/positional";
import { createAmbianceSound } from "./sounds/ambiance";
import { VolumeSetter } from "@/types";

export function createSound({
  camera,
  loadingManager,
}: CreateSoundInterface): CreateSoundReturn {
  const listener = new AudioListener();
  camera.add(listener);

  const loader = new AudioLoader(loadingManager);

  const { sound: positionalSound } = createPositionalSound(listener, loader);
  const { sound: ambianceSound } = createAmbianceSound(listener, loader);

  const soundMult = config.scene.audio.positionalAudio.fireVolumeMultiplier;

  const onVolumeChange: VolumeSetter = (v) => {
    positionalSound.setVolume(v * soundMult);
    ambianceSound.setVolume(v);

    if (!positionalSound.isPlaying) positionalSound.play();
    if (!ambianceSound.isPlaying) ambianceSound.play();
  };

  return {
    positionalSound,
    ambianceSound,
    onVolumeChange,
  };
}
