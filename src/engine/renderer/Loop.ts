import { Timer } from "three";

export type UpdateFn = (delta: number, elapsed: number) => void;
export type RenderFn = () => void;

export class Loop {
  private timer = new Timer();
  private updateFns: UpdateFn[] = [];
  private renderFns: RenderFn[] = [];
  private running = false;

  addUpdate(fn: UpdateFn) {
    this.updateFns.push(fn);
  }

  addRender(fn: RenderFn) {
    this.renderFns.push(fn);
  }

  start() {
    if (this.running) return;
    this.running = true;
    window.requestAnimationFrame(this.loop);
  }

  stop() {
    this.running = false;
  }

  private loop = () => {
    this.timer.update();
    const delta = this.timer.getDelta();
    const elapsed = this.timer.getElapsed();

    for (const fn of this.updateFns) {
      fn(delta, elapsed);
    }

    for (const fn of this.renderFns) {
      fn();
    }

    if (this.running) {
      window.requestAnimationFrame(this.loop);
    }
  };
}
