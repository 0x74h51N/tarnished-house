import * as THREE from "three";
import { params } from "../../config.json";

interface CreateSoundInterface {
  camera: THREE.PerspectiveCamera;
  loadingManager: THREE.LoadingManager;
  toggleButtonId: string;
  iconId: string;
}

interface CreateSoundReturn {
  positionalSound: THREE.PositionalAudio;
  ambianceSound: THREE.Audio;
  onVolumeChange: (v: number) => void;
}

export function createSound({
  camera,
  loadingManager,
  toggleButtonId,
  iconId,
}: CreateSoundInterface): CreateSoundReturn {
  const listener = new THREE.AudioListener();
  camera.add(listener);

  const audioLoader = new THREE.AudioLoader(loadingManager);

  const positionalSound = new THREE.PositionalAudio(listener);
  let fireLoaded = false;
  audioLoader.load("/sounds/fire.mp3", (buffer) => {
    positionalSound.setBuffer(buffer);
    positionalSound.setRefDistance(3);
    positionalSound.setLoop(true);
    positionalSound.setVolume(params.volume * 0.8);
    fireLoaded = true;
  });

  const ambianceSound = new THREE.Audio(listener);
  let ambLoaded = false;
  audioLoader.load("/sounds/ambiance.mp3", (buffer) => {
    ambianceSound.setBuffer(buffer);
    ambianceSound.setLoop(true);
    ambianceSound.setVolume(params.volume);
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
        positionalSound.setVolume(params.volume * 0.8);
        ambianceSound.setVolume(params.volume);
        if (icon instanceof HTMLImageElement) {
          icon.src = "/sound.svg";
          icon.alt = "Sound on";
        }
      }
    });
  }

  const onVolumeChange = (v: number) => {
    positionalSound.setVolume(v);
    ambianceSound.setVolume(v * 0.8);
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
