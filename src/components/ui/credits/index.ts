import config from "config.json";
import assets from "./licences.json";
import { creditsText } from "./text";
import "./styles.css";
import { byId } from "@/components/utils";

export function initCreditsModal() {
  const creditsBtn = byId("credits-btn");
  const creditsModal = byId("credits-modal");
  const closeModal = byId("close-credits");
  const assetList = byId("asset-list");
  const uiConfig = config.scene.ui.transitions;
  const thanksList = byId("thanks-list");

  const creditTextEl = byId("credits-text");
  if (creditTextEl) creditTextEl.innerHTML = creditsText;

  const list = assets.licenses
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

  const thx = assets.ty
    .map(
      (p) =>
        `<a href="${p.url}" target="_blank" rel="noopener noreferrer">${p.name}</a>`
    )
    .join("");

  thanksList.innerHTML = thx;

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
