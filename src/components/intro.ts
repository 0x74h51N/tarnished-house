import { LoadingManager } from "three";

export function intro(loadingManager: LoadingManager) {
  const closeIntro = document.getElementById("close-intro")!;
  const introModal = document.getElementById("intro-modal")!;

  if (closeIntro && introModal) {
    closeIntro.addEventListener("click", () => {
      introModal.classList.remove("active");
      setTimeout(() => introModal.classList.add("hidden"), 400);
    });
  }

  loadingManager.onLoad = () => {
    const loadingScreen = document.getElementById("loading-screen");
    if (loadingScreen) {
      loadingScreen.classList.add("hidden");
      setTimeout(() => {
        loadingScreen.style.display = "none";
      }, 600);
    }

    if (introModal) {
      introModal.classList.remove("hidden");
      introModal.classList.add("active");
    }
  };
}
