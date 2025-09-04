import { byId } from "../utils";

export function settingModalController() {
  const toggleBtn = byId<HTMLButtonElement>("settings-btn");
  const modal = byId<HTMLButtonElement>("settings-modal");
  const closeBtn = byId<HTMLButtonElement>("close-settings");

  if (!toggleBtn || !modal || !closeBtn) return;

  const hideModal = () => {
    modal.classList.remove("active");
    setTimeout(() => modal.classList.add("hidden"), 200);
  };

  const showModal = () => {
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
