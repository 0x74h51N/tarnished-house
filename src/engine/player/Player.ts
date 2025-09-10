import { Box3, type PerspectiveCamera, Vector3 } from "three";
import type { FPSController } from "../camController";
import type { PlayerOpts } from "./types";

export class Player {
  public readonly box = new Box3();
  public readonly pos = new Vector3();

  public readonly height: number;
  public readonly radius: number;

  private readonly cam: PerspectiveCamera;
  private readonly ctrl: FPSController;
  private readonly followRatio: number;

  private readonly _size = new Vector3();
  private readonly _center = new Vector3();

  constructor({
    height,
    radius,
    camera,
    controller,
    followRatio = 0.9
  }: PlayerOpts) {
    this.height = height;
    this.radius = radius;
    this.cam = camera;
    this.ctrl = controller;
    this.followRatio = followRatio;
    this.syncBox();
  }

  setPosition(x: number, y: number, z: number) {
    this.pos.set(x, y, z);
    this.syncBox();
    this.syncCamera();
  }

  setY(y: number) {
    this.pos.y = y;
    this.syncBox();
    this.syncCamera();
  }

  update(dt: number) {
    this.ctrl.update(dt);

    if (this.ctrl.dx !== 0 || this.ctrl.dz !== 0) {
      this.pos.x += this.ctrl.dx;
      this.pos.z += this.ctrl.dz;
      this.syncBox();
    }

    this.syncCamera();
  }

  private syncCamera() {
    const eyeY = this.pos.y + this.height * this.followRatio;
    this.cam.rotation.set(this.ctrl.pitch, this.ctrl.yaw, 0, "YXZ");
    this.cam.position.set(this.pos.x, eyeY, this.pos.z);
  }

  private syncBox() {
    this._size.set(this.radius * 2, this.height, this.radius * 2);
    this._center.set(this.pos.x, this.pos.y + this.height * 0.5, this.pos.z);
    this.box.setFromCenterAndSize(this._center, this._size);
  }
}
