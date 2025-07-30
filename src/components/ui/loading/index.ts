import config from "config.json";

export function hideLoadingScreen() {
  const loadingScreen = document.getElementById("loading-screen");
  const uiConfig = config.scene.ui.transitions;

  if (loadingScreen) {
    loadingScreen.classList.add("hidden");
    setTimeout(() => {
      loadingScreen.style.display = "none";
    }, uiConfig.loadingScreen);
  }
}
