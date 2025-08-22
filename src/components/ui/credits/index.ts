import assets from "./licances.json";
import config from "config.json";
import { creditsText } from "./text";
import "./styles.css";

export function initCreditsModal() {
  const creditsBtn = document.getElementById("credits-btn")!;
  const creditsModal = document.getElementById("credits-modal")!;
  const closeModal = document.getElementById("close-credits")!;
  const assetList = document.getElementById("asset-list")!;
  const uiConfig = config.scene.ui.transitions;

  const creditTextEl = document.getElementById("credits-text")!;

  if (creditTextEl) creditTextEl.innerHTML = creditsText;
  const list = assets
    .map(
      (asset) => `
      <li class="asset-card">
        <strong>${asset.type}</strong>
        <div id="asset-author">Author: ${asset.author}</div>
        <div id="asset-source">
          Source: <a href="${asset.source.url}" target="_blank">${
        asset.source.name
      }</a>
        </div>
        <div id="asset-license">License: ${asset.license}</div>
        ${
          asset.modifiedBy
            ? `<div id="asset-modified">Modified by: ${asset.modifiedBy}</div>`
            : ""
        }
        ${
          asset.modifications
            ? `<div id="asset-modifications">Modifications: ${asset.modifications}</div>`
            : ""
        }
      </li>
    `
    )
    .join("");

  assetList.innerHTML = list;

  creditsBtn.addEventListener("click", () => {
    creditsModal.classList.add("active");
    creditsModal.classList.remove("hidden");
  });

  closeModal.addEventListener("click", () => {
    creditsModal.classList.remove("active");
    setTimeout(() => creditsModal.classList.add("hidden"), uiConfig.modalClose);
  });

  creditsModal.addEventListener("click", (e) => {
    if (e.target === creditsModal) {
      creditsModal.classList.remove("active");
      setTimeout(
        () => creditsModal.classList.add("hidden"),
        uiConfig.modalClose
      );
    }
  });
}
