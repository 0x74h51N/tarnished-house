import { VolumeSetter } from "@/types";
import {
  PerspectiveCamera,
  LoadingManager,
  PositionalAudio,
  Audio,
} from "three";

export interface CreateSoundInterface {
  camera: PerspectiveCamera;
  loadingManager: LoadingManager;
}

export interface CreateSoundReturn {
  positionalSound: PositionalAudio;
  ambianceSound: Audio;
  onVolumeChange: VolumeSetter;
}
