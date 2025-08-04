import { vec3From } from "@/utils";
import { SettingsInterface } from "./types";
import config from "config.json";

export function settingModalController({
  camPositioner,
}: Pick<SettingsInterface, "camPositioner">) {
  const toggleBtn = document.getElementById("settings-btn");
  const modal = document.getElementById("settings-modal");
  const closeBtn = document.getElementById("close-settings");

  if (!toggleBtn || !modal || !closeBtn) return;

  const hideModal = () => {
    camPositioner.restorePosition();

    modal.classList.remove("active");
    setTimeout(() => modal.classList.add("hidden"), 200);
  };

  const showModal = () => {
    camPositioner.setPosition({
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
