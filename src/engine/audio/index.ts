import { AudioListener, AudioLoader, type LoadingManager } from "three";
import type { AudioAPI } from "./types";
import type { CameraReturn } from "../camera";
import { createPositionalSound, createAmbianceSound } from "./sounds";

interface CreateAudio {
  camera: CameraReturn["camera"];
  loadingManager: LoadingManager;
}

export function createAudio({ camera, loadingManager }: CreateAudio): AudioAPI {
  const listener = new AudioListener();
  camera.add(listener);

  const loader = new AudioLoader(loadingManager);

  function setVol(v: number) {
    listener.setMasterVolume(v);
  }

  const createAudio = {
    loader,
    listener
  };
  const createPositional = createPositionalSound(createAudio);

  const createAmbience = createAmbianceSound(createAudio);

  async function resume() {
    if (listener.context.state !== "running") await listener.context.resume();
  }

  return { setVol, createPositional, createAmbience, resume };
}

export * from "./utils";
export * from "./types";
