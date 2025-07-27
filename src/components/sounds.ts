import {
  PerspectiveCamera,
  LoadingManager,
  PositionalAudio,
  AudioLoader,
  AudioListener,
  Audio,
} from "three";
import config from "config.json";

interface CreateSoundInterface {
  camera: PerspectiveCamera;
  loadingManager: LoadingManager;
  toggleButtonId: string;
  iconId: string;
}

interface CreateSoundReturn {
  positionalSound: PositionalAudio;
  ambianceSound: Audio;
  onVolumeChange: (v: number) => void;
}

export function createSound({
  camera,
  loadingManager,
  toggleButtonId,
  iconId,
}: CreateSoundInterface): CreateSoundReturn {
  const listener = new AudioListener();
  camera.add(listener);

  const audioLoader = new AudioLoader(loadingManager);

  const positionalSound = new PositionalAudio(listener);
  let fireLoaded = false;
  const audioConfig = config.scene.audio;
  audioLoader.load(config.assets.sounds.fire, (buffer) => {
    positionalSound.setBuffer(buffer);
    positionalSound.setRefDistance(audioConfig.positionalAudio.refDistance);
    positionalSound.setLoop(true);
    positionalSound.setVolume(
      audioConfig.volume * audioConfig.positionalAudio.fireVolumeMultiplier
    );
    fireLoaded = true;
  });

  const ambianceSound = new Audio(listener);
  let ambLoaded = false;
  audioLoader.load(config.assets.sounds.ambiance, (buffer) => {
    ambianceSound.setBuffer(buffer);
    ambianceSound.setLoop(true);
    ambianceSound.setVolume(audioConfig.volume);
    ambLoaded = true;
  });

  let isMuted = true;
  const btn = document.getElementById(toggleButtonId);
  const icon = document.getElementById(iconId);
  if (btn && icon) {
    btn.addEventListener("click", () => {
      isMuted = !isMuted;
      if (isMuted) {
        positionalSound.setVolume(0);
        ambianceSound.setVolume(0);
        if (icon instanceof HTMLImageElement) {
          icon.src = "/sound-off.svg";
          icon.alt = "Sound off";
        }
      } else {
        if (fireLoaded && !positionalSound.isPlaying) positionalSound.play();
        if (ambLoaded && !ambianceSound.isPlaying) ambianceSound.play();
        positionalSound.setVolume(
          audioConfig.volume * audioConfig.positionalAudio.fireVolumeMultiplier
        );
        ambianceSound.setVolume(audioConfig.volume);
        if (icon instanceof HTMLImageElement) {
          icon.src = "/sound.svg";
          icon.alt = "Sound on";
        }
      }
    });
  }

  const onVolumeChange = (v: number) => {
    positionalSound.setVolume(v);
    ambianceSound.setVolume(
      v * audioConfig.positionalAudio.fireVolumeMultiplier
    );
    if (fireLoaded && !positionalSound.isPlaying) {
      positionalSound.play();
      if (icon instanceof HTMLImageElement) {
        icon.src = "/sound.svg";
        icon.alt = "Sound on";
      }
    }
    if (ambLoaded && !ambianceSound.isPlaying) {
      ambianceSound.play();
    }
  };

  return { positionalSound, ambianceSound, onVolumeChange };
}
