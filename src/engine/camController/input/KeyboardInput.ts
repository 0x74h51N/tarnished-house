import { IS_DEV } from "@/main";
import type { InputProvider, InputSample } from "./types";

export class KeyboardInput implements InputProvider {
  private pressed = new Set<string>();
  private lookDX = 0;
  private lookDY = 0;
  private onKeyDown = (e: KeyboardEvent) => {
    const t = e.target as HTMLElement | null;
    if (
      t &&
      (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)
    )
      return;
    this.pressed.add(e.code);
  };
  private onKeyUp = (e: KeyboardEvent) => this.pressed.delete(e.code);
  private onMouseMove = (e: MouseEvent) => {
    if (!this.isLocked()) return;
    this.lookDX += e.movementX;
    this.lookDY += e.movementY;
  };
  private onEsc = (e: KeyboardEvent) => {
    if (e.code === "Escape" && document.pointerLockElement === this.canvas) {
      document.exitPointerLock();
    }
  };
  private onCanvasClick = () => {
    if (!this.isLocked() && !IS_DEV && this.isActive())
      this.canvas.requestPointerLock();
  };

  constructor(
    private canvas: HTMLCanvasElement,
    private getMouseSens: () => number,
    private isActive: () => boolean
  ) {
    this.canvas.addEventListener("click", this.onCanvasClick);
    document.addEventListener("mousemove", this.onMouseMove);
    window.addEventListener("keydown", this.onEsc);
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
  }

  private isLocked = () =>
    this.isActive() && document.pointerLockElement === this.canvas;

  sample(): InputSample {
    let mx = 0,
      mz = 0;
    const sens = this.getMouseSens();

    if (this.pressed.has("KeyW") || this.pressed.has("ArrowUp")) mz += 1;
    if (this.pressed.has("KeyS") || this.pressed.has("ArrowDown")) mz -= 1;
    if (this.pressed.has("KeyA") || this.pressed.has("ArrowLeft")) mx -= 1;
    if (this.pressed.has("KeyD") || this.pressed.has("ArrowRight")) mx += 1;

    const len = Math.hypot(mx, mz);
    if (len > 1) {
      mx /= len;
      mz /= len;
    }

    // Mouse delta to rad/s (screen px -> yaw/pitch speed)
    const dx = this.lookDX,
      dy = this.lookDY;
    this.lookDX = this.lookDY = 0;
    const lookX = dx * sens;
    const lookY = -dy * sens;

    const sprint =
      this.pressed.has("ShiftLeft") || this.pressed.has("ShiftRight");
    return { moveX: mx, moveY: mz, lookX, lookY, sprint };
  }

  destroy() {
    this.canvas.removeEventListener("click", this.onCanvasClick);
    document.removeEventListener("mousemove", this.onMouseMove);
    window.removeEventListener("keydown", this.onEsc);
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
  }
}
