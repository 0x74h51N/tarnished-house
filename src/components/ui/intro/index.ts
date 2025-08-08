import config from "config.json";
import { introText } from "./text";

export function initIntroModal(): (fn?: () => void) => void {
  const introTextEl = document.getElementById("intro-text")!;
  const introModal = document.getElementById("intro-modal")!;

  introTextEl.innerHTML = introText;

  setTimeout(() => {
    requestAnimationFrame(() => {
      introModal.classList.add("visible");
    });
  }, 1);

  const btnContainer = document.getElementById("btn-container")!;
  const loadingScreen = document.getElementById("loading-screen")!;
  const loader = document.getElementById("loader")!;
  const enterBtn = document.getElementById("enter-scene") as HTMLButtonElement;
  const uiConfig = config.scene.ui.transitions;

  return function showEnterButton(fn?: () => void) {
    loadingScreen.classList.add("trans");

    loader.querySelector(".spinner")?.remove();
    loader.querySelector(".loading-text")?.remove();
    loader.classList.add("hide-originals");

    loader.appendChild(enterBtn);
    requestAnimationFrame(() => {
      enterBtn.classList.add("visible");
    });

    enterBtn.addEventListener("click", () => {
      loadingScreen.classList.add("hidden");
      btnContainer.classList.remove("hidden");
      fn && fn();
      setTimeout(() => {
        loadingScreen.style.display = "none";
      }, uiConfig.loadingScreen);
    });
  };
}
