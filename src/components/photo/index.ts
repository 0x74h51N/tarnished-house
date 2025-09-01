import type { WebGLRenderer } from "three";
import type { EffectComposer } from "three/examples/jsm/Addons";
import { byId } from "../utils";

interface ScreenshotOptions {
  renderer: WebGLRenderer;
  composer: EffectComposer;
}

export function initScreenshotButton({
  renderer,
  composer
}: ScreenshotOptions) {
  const btn = byId("photo-shot");

  const canvas = renderer.domElement;

  btn.addEventListener("click", () => {
    composer.render();

    requestAnimationFrame(() => {
      canvas.toBlob((blob) => {
        if (!blob) return;

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `screenshot_${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }, "image/png");
    });
  });
}
