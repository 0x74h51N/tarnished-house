export * from "./types";

import { settingModalController } from "./controller";
import {
  makeGeneralSettings,
  makeGraphicsSettings,
  makeSceneSettings
} from "./data";
import { makeDisplaySettings } from "./data/display";
import { inputRender } from "./inputRender";
import type { SettingsInterface } from "./types";
import "./styles.css";
import { byId } from "../utils";

export function settings({
  lights,
  renderer,
  randomMeshes,
  antialias,
  audio,
  scene,
  toggleStats,
  CamController,
  syncBloom,
  terrain
}: SettingsInterface) {
  const settingsDiv = byId("settings");

  //----------------------- Settings Menu -----------------------
  //Input Controllers
  const controls = makeGeneralSettings({
    audio
  });
  const display = makeDisplaySettings({
    toggleStats,
    renderer,
    camera: CamController.camera
  });
  const graphics = makeGraphicsSettings({
    lights,
    renderer,
    antialias,
    scene,
    syncBloom,
    randomMeshes,
    CamController,
    terrain
  });
  const sceneOpts = makeSceneSettings({ randomMeshes });

  // Input Controllers Dom penetration!
  settingsDiv.innerHTML =
    controls.map((c) => inputRender(c)).join("") +
    "<h3>Display</h3>" +
    display.map((c) => inputRender(c)).join("") +
    "<h3>Graphics</h3>" +
    graphics.map((c) => inputRender(c)).join("") +
    "<h3>Scene</h3><h4>Intensity</h4>" +
    sceneOpts.map((c) => inputRender(c)).join("") +
    "<br /><em>Secrets lie beneath<br />Should thy fingers recall<br />the first glyph of help twice</em>";

  //Input Event listeners
  const handlers = Object.fromEntries(
    [...controls, ...display, ...graphics, ...sceneOpts].map((c) => [
      c.id,
      c.onChange as EventListener
    ])
  );

  function handleEvent(e: Event) {
    const el = (e.target as HTMLElement).closest<HTMLElement>("input, select");
    if (!el?.id) return;
    handlers[el.id]?.(e);
  }
  settingsDiv.addEventListener("input", handleEvent);
  settingsDiv.addEventListener("change", handleEvent);

  //----------------------------------------------

  //Settings Modal Button Slapper
  settingModalController();
}
