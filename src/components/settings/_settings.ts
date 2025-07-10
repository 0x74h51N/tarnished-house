import { makeControls, makeGraphics, makeScene, fog } from "./settingsData";
import { renderSettings } from "./uiRender";
import { settingsController } from "./settingsController";
import config from "../../../config.json";
import { ManagerTypes } from "types";
import type { Light, Scene, WebGLRenderer } from "three";
import { getCountConfigs } from "../../utils/_index";

interface SettingsInterface {
  lights: Light[];
  renderer: WebGLRenderer;
  gltfAssets: ManagerTypes[];
  antialias: boolean;
  onVolumeChange: (v: number) => void;
  scene: Scene;
  stats: Stats;
}

export function settings({
  lights,
  renderer,
  gltfAssets,
  antialias,
  onVolumeChange,
  scene,
  stats,
}: SettingsInterface) {
  scene.fog = fog;

  const countConfigs = getCountConfigs(
    gltfAssets,
    config.assets.models.spawnable
  );

  const settingsDiv = document.getElementById("settings");

  const controls = makeControls();
  const graphics = makeGraphics(antialias, renderer);
  const sceneOpts = makeScene();

  renderSettings({
    container: settingsDiv!,
    controls,
    graphics,
    scene: sceneOpts,
  });

  settingsController({
    lights,
    renderer,
    countConfigs,
    onVolumeChange,
    scene,
    stats,
  });
}
