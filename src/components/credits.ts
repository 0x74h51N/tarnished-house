import assets from "../../assetLicense.json";
import config from "../../config.json";

export function credits() {
  const creditsBtn = document.getElementById("credits-btn")!;
  const creditsModal = document.getElementById("credits-modal")!;
  const closeModal = document.getElementById("close-credits")!;
  const uiConfig = config.scene.ui.transitions;

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

  function renderAssetList() {
    const assetList = document.getElementById("asset-list")!;
    assetList.innerHTML = assets
      .map(
        (asset) => `
    <li class="asset-card">
      <strong>${asset.type}</strong>
      <div class="asset-author">Author: ${asset.author}</div>
      <div class="asset-source">
        Source: <a href="${asset.source.url}" target="_blank">${asset.source.name}</a>
      </div>
      <div class="asset-license">License: ${asset.license}</div>
    </li>
  `
      )
      .join("");
  }

  renderAssetList();
}
