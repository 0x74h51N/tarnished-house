import { vec3From } from "@/utils";
import { SettingsInterface } from "./types";
import config from "config.json";
import { CameraSystemReturn } from "@/engine";

export function settingModalController({
  positioner,
}: Pick<CameraSystemReturn, "positioner">) {
  const toggleBtn = document.getElementById("settings-btn");
  const modal = document.getElementById("settings-modal");
  const closeBtn = document.getElementById("close-settings");

  if (!toggleBtn || !modal || !closeBtn) return;

  const hideModal = () => {
    positioner.restorePosition();

    modal.classList.remove("active");
    setTimeout(() => modal.classList.add("hidden"), 200);
  };

  const showModal = () => {
    positioner.setPosition({
      cameraPos: vec3From(config.settings.cameraPos),
      targetPos: vec3From(config.settings.targetPos),
    });
    modal.classList.remove("hidden");
    setTimeout(() => modal.classList.add("active"), 100);
  };

  toggleBtn.addEventListener("click", () => {
    if (modal.classList.contains("active")) {
      hideModal();
    } else {
      showModal();
    }
  });

  closeBtn.addEventListener("click", hideModal);
}
