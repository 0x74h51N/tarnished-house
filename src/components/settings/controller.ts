import config from "config.json";
import type { CamController } from "@/engine";
import { v3 } from "@/utils";
import { byId } from "../utils";

export function settingModalController({
  positioner
}: Pick<CamController, "positioner">) {
  const toggleBtn = byId<HTMLButtonElement>("settings-btn");
  const modal = byId<HTMLButtonElement>("settings-modal");
  const closeBtn = byId<HTMLButtonElement>("close-settings");

  if (!toggleBtn || !modal || !closeBtn) return;

  const hideModal = () => {
    positioner.restorePosition();

    modal.classList.remove("active");
    setTimeout(() => modal.classList.add("hidden"), 200);
  };

  const showModal = () => {
    positioner.setPosition({
      cameraPos: v3(config.settings.cameraPos),
      targetPos: v3(config.settings.targetPos)
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
