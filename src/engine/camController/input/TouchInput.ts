import { classIncludes } from "@/utils";
import { expLerp } from "../utils/helpers";
import { createJoystick } from "../utils/joystick";
import type { InputProvider, InputSample } from "./types";

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
