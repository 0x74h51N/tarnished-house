import {
  makeGeneralSettings,
  makeGraphicsSettings,
  makeSceneSettings,
} from "./settingsData";
import { controlRenderer } from "./utils/controlRenderer";
import { SettingsInterface } from "./types";

export function settings({
  lights,
  renderer,
  randomMeshes,
  antialias,
  onVolumeChange,
  scene,
  stats,
}: SettingsInterface) {
  const settingsDiv = document.getElementById("settings");

  //Controllers
  const controls = makeGeneralSettings({ renderer, onVolumeChange });
  const graphics = makeGraphicsSettings({
    lights,
    renderer,
    antialias,
    scene,
    stats,
  });
  const sceneOpts = makeSceneSettings({ randomMeshes });

  //Settings controllers dom penetration!
  settingsDiv!.innerHTML =
    controls.map((c) => controlRenderer(c)).join("") +
    "<h3>Graphics</h3>" +
    graphics.map((c) => controlRenderer(c)).join("") +
    "<h3>Scene</h3>" +
    sceneOpts.map((c) => controlRenderer(c)).join("") +
    "<br /><em>Secrets lie beneath<br />Should thy fingers recall<br />the first glyph of help twice.</em>";

  //Event listeners
  [...controls, ...graphics, ...sceneOpts].forEach((c) => {
    const el = document.getElementById(c.id)!;
    const evt = c.type === "range" ? "input" : "change";
    el.addEventListener(evt, c.onChange as EventListener);
  });

  //Settings Button Slapper
  const toggleBtn = document.getElementById("settings-btn");
  const modal = document.getElementById("settings-modal");
  const closeBtn = document.getElementById("close-settings");

  const hideModal = () => {
    modal!.classList.remove("active");
    setTimeout(() => modal!.classList.add("hidden"), 200);
  };
  toggleBtn!.addEventListener("click", () => {
    modal!.classList.remove("hidden");
    setTimeout(() => modal!.classList.add("active"), 100);
  });
  closeBtn!.addEventListener("click", hideModal);
  modal!.addEventListener("click", (e) => {
    if (e.target === modal) hideModal();
  });
}
