export * from "./types";

import {
  makeGeneralSettings,
  makeGraphicsSettings,
  makeSceneSettings,
} from "./data";
import { inputRender } from "./inputRender";
import { SettingsInterface } from "./types";
import { settingModalController } from "./controller";
import { makeDisplaySettings } from "./data/display";

export function settings({
  lights,
  renderer,
  randomMeshes,
  antialias,
  audio,
  scene,
  stats,
  CamController,
}: SettingsInterface) {
  const settingsDiv = document.getElementById("settings");

  //----------------------- Settings Menu -----------------------
  //Input Controllers
  const controls = makeGeneralSettings({
    audio,
  });
  const display = makeDisplaySettings({
    stats,
    renderer,
    camera: CamController.camera,
  });
  const graphics = makeGraphicsSettings({
    lights,
    renderer,
    antialias,
    scene,
  });
  const sceneOpts = makeSceneSettings({ randomMeshes });

  // Input Controllers Dom penetration!
  settingsDiv!.innerHTML =
    controls.map((c) => inputRender(c)).join("") +
    "<h3>Display</h3>" +
    display.map((c) => inputRender(c)).join("") +
    "<h3>Graphics</h3>" +
    graphics.map((c) => inputRender(c)).join("") +
    "<h3>Scene</h3><h4>Intensity</h4>" +
    sceneOpts.map((c) => inputRender(c)).join("") +
    "<br /><em>Secrets lie beneath<br />Should thy fingers recall<br />the first glyph of help twice</em>";

  //Input Event listeners
  [...controls, ...display, ...graphics, ...sceneOpts].forEach((c) => {
    const el = document.getElementById(c.id)!;
    const evt = c.type === "range" ? "input" : "change";
    el.addEventListener(evt, c.onChange as EventListener);
  });
  //----------------------------------------------

  //Settings Modal Button Slapper
  settingModalController({ positioner: CamController.positioner });
}
