export * from "./types";

import GUI from "lil-gui";
import config from "config.json";
import {
  createHelpers,
  createGraphicsSettings,
  createLightSettings,
  createSceneSettings,
  createCameraSettings,
  createParticleSettings,
} from "./folders";
import { HelperParams, SetupGUIInterface } from ".";

const createParams = () => ({
  helpers: {
    showAxes: false,
    axesSize: 50,
    axesPositionX: 0,
    axesPositionY: 1,
    axesPositionZ: 1,
    showGrid: false,
    gridSize: 100,
    gridDivisions: 10,
    gridPositionY: 0,
  } as HelperParams,

  volume: config.scene.audio.volume,
});

export function initSetupGUI({
  renderer,
  camera,
  cameraHelper,
  randomMeshes,
  antialias,
  audio,
  bloomPass,
  lights,
  scene,
  particleSystems,
}: SetupGUIInterface) {
  const params = createParams();

  // Initialize GUI
  const gui = new GUI({ title: "Settings" }).close();
  gui.hide();

  document.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "h") {
      if (gui._hidden || gui._hidden) {
        gui.show();
      } else {
        gui.hide();
      }
    }
  });

  // Volume
  gui
    .add(params, "volume", 0, 1.5, 0.1)
    .name("Volume")
    .onChange((v: number) => {
      if (audio.setVolume) {
        audio.setVolume(v);
        audio.updateIcon(v);
      }
    });

  createHelpers(gui, scene, params.helpers);

  createGraphicsSettings(gui, renderer, lights, bloomPass, antialias);

  createLightSettings(gui, scene, lights);

  createSceneSettings(gui, randomMeshes);

  createCameraSettings(gui, scene, camera, cameraHelper);

  createParticleSettings(gui, particleSystems);

  return gui;
}
