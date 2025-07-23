import { LoadingManager } from "three";
import config from "../../../config.json";

export function intro(loadingManager: LoadingManager) {
  const closeIntro = document.getElementById("close-intro")!;
  const introModal = document.getElementById("intro-modal")!;
  const uiConfig = config.scene.ui.transitions;

  if (closeIntro && introModal) {
    closeIntro.addEventListener("click", () => {
      introModal.classList.remove("active");
      setTimeout(() => introModal.classList.add("hidden"), uiConfig.modalClose);
    });
  }

  loadingManager.onLoad = () => {
    const loadingScreen = document.getElementById("loading-screen");
    if (loadingScreen) {
      loadingScreen.classList.add("hidden");
      setTimeout(() => {
        loadingScreen.style.display = "none";
      }, uiConfig.loadingScreen);
    }

    if (introModal) {
      introModal.classList.remove("hidden");
      introModal.classList.add("active");
    }
  };
}
