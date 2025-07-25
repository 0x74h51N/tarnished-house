import GUI from "lil-gui";
import config from "../../../config.json";
import {
  SetupGUIInterface,
  createHelpers,
  createGraphicsSettings,
  createLightSettings,
  createSceneSettings,
  createCameraSettings,
  createParticleSettings,
  HelperParams,
} from ".";
import { PointLight, DirectionalLight } from "three";

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

export function setupGUI({
  renderer,
  camera,
  cameraHelper,
  randomMeshes,
  antialias,
  onVolumeChange,
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
      if (onVolumeChange) onVolumeChange(v);
    });

  createHelpers(gui, scene, params.helpers);

  createGraphicsSettings(gui, renderer, lights, bloomPass, antialias);

  createLightSettings(gui, scene, lights);

  createSceneSettings(gui, randomMeshes);

  createCameraSettings(gui, scene, camera, cameraHelper);

  createParticleSettings(gui, particleSystems);

  return gui;
}
