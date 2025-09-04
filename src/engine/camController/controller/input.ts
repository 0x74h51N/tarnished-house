import { classIncludes } from "@/utils";
import { createJoystick } from "./joystick";
import { expLerp } from "./utils";

export type InputSample = {
  moveX: number;
  moveY: number;
  lookX: number; // rad/s,
  lookY: number; // rad/s,
  sprint: boolean;
};

export interface InputProvider {
  sample(dt: number): InputSample;
  destroy(): void;
}

/* ---------------- Keyboard & Mouse ---------------- */
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
    if (!this.isLocked() && this.isActive()) this.canvas.requestPointerLock();
  };
  private onPLC = () => {
    const locked = this.isLocked();
    this.canvas.style.cursor = locked ? "none" : "";
  };

  constructor(
    private canvas: HTMLCanvasElement,
    private getMouseSens: () => number,
    private isActive: () => boolean
  ) {
    this.canvas.addEventListener("click", this.onCanvasClick);
    document.addEventListener("pointerlockchange", this.onPLC);
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
    document.removeEventListener("pointerlockchange", this.onPLC);
    document.removeEventListener("mousemove", this.onMouseMove);
    window.removeEventListener("keydown", this.onEsc);
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
  }
}

/* ---------------- Touch (Dual Joystick) ---------------- */
export class TouchInput implements InputProvider {
  private lxs = 0; // look x smoothed
  private lys = 0; // look y smoothed
  private left = createJoystick({
    size: 120,
    position: { left: "70px", bottom: "80px" }
  });
  private right = createJoystick({
    size: 120,
    position: { right: "70px", bottom: "80px" }
  });

  constructor(
    private mobileLook: {
      lookDead: number;
      turnTau: number;
      expo?: number;
    },
    private getSensitivity: () => number,
    private isActive: () => boolean,
    loadingScreen: HTMLElement | null
  ) {
    this.left.hide();
    this.right.hide();
    const showIfActive = () => {
      if (this.isActive()) {
        this.left.show();
        this.right.show();
      }
    };
    showIfActive();
    if (loadingScreen) {
      classIncludes(loadingScreen, "hidden", () => {
        showIfActive();
      });
    }
  }

  sample(dt: number): InputSample {
    const mv = this.left.get();
    let mx = mv.x,
      mz = mv.y;
    const len = Math.hypot(mx, mz);
    if (len > 1) {
      mx /= len;
      mz /= len;
    }

    // look smoothing + non-linear gain
    const { lookDead, turnTau, expo = 1.6 } = this.mobileLook;
    const lv = this.right.get();
    this.lxs = expLerp(this.lxs, lv.x, turnTau, dt);
    this.lys = expLerp(this.lys, lv.y, turnTau, dt);

    const mag = Math.hypot(this.lxs, this.lys);
    let lookX = 0,
      lookY = 0;
    if (mag > lookDead) {
      const norm = (mag - lookDead) / (1 - lookDead);
      const gain = Math.min(1, Math.max(0, norm)) ** expo;

      const sens = this.getSensitivity();

      const yawRate = Math.PI * sens;
      const pitchRate = Math.PI * sens;

      lookX = this.lxs * yawRate * gain;
      lookY = this.lys * pitchRate * gain;
    }

    return { moveX: mx, moveY: mz, lookX, lookY, sprint: false };
  }

  destroy() {
    this.left.destroy();
    this.right.destroy();
  }
}
