import config from "config.json";
import { introText } from "./text";

export function initIntroModal() {
  const closeIntro = document.getElementById("close-intro")!;
  const introModal = document.getElementById("intro-modal")!;
  const introTextEl = document.getElementById("intro-text")!;
  const uiConfig = config.scene.ui.transitions;

  if (introTextEl) introTextEl.innerHTML = introText;

  if (closeIntro && introModal) {
    closeIntro.addEventListener("click", () => {
      introModal.classList.remove("active");
      setTimeout(() => introModal.classList.add("hidden"), uiConfig.modalClose);
    });
  }
}

export function showIntroModal() {
  const introModal = document.getElementById("intro-modal")!;
  introModal.classList.remove("hidden");
  introModal.classList.add("active");
}
