import GUI from "lil-gui";
import { AudioBundle } from "@/types/global.types";
import config from "config.json";
import { RuntimeCtrl } from "../types";

export function createGeneral(gui: GUI, audio: AudioBundle): RuntimeCtrl {
  let paused = false;

  const runtime: RuntimeCtrl & { timeScale: number } = {
    isPaused: () => paused,
    togglePause: () => {
      paused = !paused;
    },
    timeScale: 1,
  };

  const buttons = {
    pauseOrResume: () => {
      runtime.togglePause();
      pauseCtrl.name(runtime.isPaused() ? "Resume" : "Pause");
    },
  };
  const pauseCtrl = gui.add(buttons, "pauseOrResume").name("Pause");

  gui.add(runtime, "timeScale", 0.05, 5, 0.05).name("Time Scale");

  // Volume
  gui
    .add(config.scene.audio, "volume", 0, 1.5, 0.1)
    .name("Volume")
    .onChange((v: number) => {
      if (audio.setVol) {
        audio.setVol(v);
        audio.updtMuteIcon(v);
      }
    });

  return runtime;
}
