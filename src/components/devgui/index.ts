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
import { SetupGUIInterface } from ".";
import { SetupGUI } from "./types";
import { createGeneral } from "./folders/general";

export function initSetupGUI({
  devMode,
  renderer,
  CamController,
  randomMeshes,
  antialias,
  audio,
  bloomPass,
  lights,
  scene,
  particleSystems,
  syncBloom,
}: SetupGUIInterface): SetupGUI {
  // Initialize GUI
  const gui = new GUI({ title: "Settings" }).close();

  devMode ? gui.show() : gui.hide();

  document.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "h") {
      if (gui._hidden || gui._hidden) {
        gui.show();
      } else {
        gui.hide();
      }
    }
  });

  const runtime = createGeneral(gui, audio);

  createHelpers(gui, scene);

  createGraphicsSettings(
    gui,
    renderer,
    lights,
    bloomPass,
    antialias,
    scene,
    syncBloom
  );

  createLightSettings(gui, scene, lights);

  createSceneSettings(gui, randomMeshes, scene);

  const { camera, cameraHelper } = CamController;
  createCameraSettings(gui, scene, camera, cameraHelper!);

  createParticleSettings(gui, particleSystems);

  return { gui, runtime };
}
