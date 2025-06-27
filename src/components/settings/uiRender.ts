import { GeneralControl } from "types";
import { controlHelper } from "./controlHelper.js";

interface RenderSettingsInterface {
  container: HTMLElement;
  controls: GeneralControl[];
  graphics: GeneralControl[];
  scene: GeneralControl[];
}

export function renderSettings({
  container,
  controls,
  graphics,
  scene,
}: RenderSettingsInterface) {
  container.innerHTML =
    controls.map((c) => controlHelper(c)).join("") +
    "<h3>Graphics</h3>" +
    graphics.map((c) => controlHelper(c)).join("") +
    "<h3>Scene</h3>" +
    scene.map((c) => controlHelper(c)).join("");
}
