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
