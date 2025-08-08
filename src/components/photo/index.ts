import { WebGLRenderer } from "three";
import { EffectComposer } from "three/examples/jsm/Addons";

interface ScreenshotOptions {
  renderer: WebGLRenderer;
  composer: EffectComposer;
}

export function initScreenshotButton({
  renderer,
  composer,
}: ScreenshotOptions) {
  const btn = document.getElementById("photo-shot")!;

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
