import {
  LinearFilter,
  LinearMipmapLinearFilter,
  Mesh,
  type MeshStandardMaterial,
  type Scene
} from "three";
import type { TextureKeys } from "@/types/global.types";
import { byId } from "..";

export function isFullscreen(): boolean {
  const d = document;
  return !!d.fullscreenElement;
}

export function enterFullscreen(el: HTMLElement) {
  if (el.requestFullscreen)
    return el.requestFullscreen({ navigationUI: "hide" });
}

export function exitFullscreen() {
  const d = document;
  if (d.exitFullscreen) return d.exitFullscreen();
}

export async function setFullscreen(
  on: boolean,
  el: HTMLElement = document.documentElement
) {
  if (on) {
    if (!document.fullscreenElement)
      await el.requestFullscreen({ navigationUI: "hide" });
    await lockEscKey();
  } else {
    unlockKeyboard();
    if (document.fullscreenElement) await document.exitFullscreen();
  }
}
document.addEventListener("fullscreenchange", () => {
  const box = byId("fullScreen") as HTMLInputElement | null;
  if (box) box.checked = isFullscreen();
});

export function keyboardLockSupported(): boolean {
  return !!navigator.keyboard?.lock;
}

export async function lockEscKey(): Promise<boolean> {
  if (!keyboardLockSupported()) return false;
  try {
    await navigator.keyboard?.lock(["Escape"]);
    return true;
  } catch {
    return false;
  }
}

export function unlockKeyboard(): void {
  navigator.keyboard?.unlock();
}

export function applySceneAniso(scene: Scene, v: number) {
  scene.traverse((o) => {
    if (o instanceof Mesh) {
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      mats.forEach((mat: MeshStandardMaterial) => {
        for (const key of Object.keys(mat) as TextureKeys[]) {
          const tex = mat[key];
          if (tex?.isTexture && !tex.isRenderTargetTexture) {
            if (tex.anisotropy !== v) {
              tex.anisotropy = v;
              tex.generateMipmaps = true;
              tex.minFilter = LinearMipmapLinearFilter;
              tex.magFilter = LinearFilter;
              tex.needsUpdate = true;
            }
          }
        }
      });
    }
  });
}
