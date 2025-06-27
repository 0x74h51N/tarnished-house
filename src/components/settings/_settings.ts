import { makeControls, makeGraphics, makeScene, fog } from "./settingsData";
import { renderSettings } from "./uiRender";
import { settingsController } from "./settingsController";
import { bushOptions, graveOptions, treeOptions } from "../../../config.json";
import { AssetTypes } from "types";
import type { Light, Scene, WebGLRenderer } from "three";

interface SettingsInterface {
  lights: Light[];
  renderer: WebGLRenderer;
  graves: AssetTypes;
  bushes: AssetTypes;
  trees: AssetTypes;
  antialias: boolean;
  onVolumeChange: (v: number) => void;
  scene: Scene;
  stats: Stats;
}

export function settings({
  lights,
  renderer,
  graves,
  bushes,
  trees,
  antialias,
  onVolumeChange,
  scene,
  stats,
}: SettingsInterface) {
  scene.fog = fog;

  const countConfigs = {
    graveCount: { manager: graves, opts: graveOptions },
    bushCount: { manager: bushes, opts: bushOptions },
    treeCount: { manager: trees, opts: treeOptions },
  };

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
