import config from "config.json";
import { introText } from "./text";
import "./styles.css";
import { byId } from "@/components/utils";

export function initIntroModal(): (fn?: () => void) => void {
  const introTextEl = byId("intro-text");
  const introModal = byId("intro-modal");

  introTextEl.innerHTML = introText;

  setTimeout(() => {
    requestAnimationFrame(() => {
      introModal.classList.add("visible");
    });
  }, 1);

  const btnContainer = byId("btn-container");
  const loadingScreen = byId("loading-screen");
  const loader = byId("loader");
  const enterBtn = byId("enter-scene") as HTMLButtonElement;
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
      fn?.();
      setTimeout(() => {
        loadingScreen.style.display = "none";
      }, uiConfig.loadingScreen);
    });
  };
}
