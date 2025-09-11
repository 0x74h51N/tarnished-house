import { Vector3 } from "three";

export class ShadowUpdateGate {
  private lastPos = new Vector3();
  private lastYaw = 0;
  private lastPitch = 0;

  private readonly pos2: number; // threshold^2 (m^2)
  private readonly rotRad: number; // threshold (rad)

  constructor(
    readonly getYawPitch: () => { yaw: number; pitch: number },
    readonly getPos: () => Vector3,
    posThresh = 0.15, // m
    rotThreshDeg = 1.0 // deg
  ) {
    this.pos2 = posThresh * posThresh;
    this.rotRad = (rotThreshDeg * Math.PI) / 180;

    // snapshot
    this.lastPos.copy(this.getPos());
    const { yaw, pitch } = this.getYawPitch();
    this.lastYaw = yaw;
    this.lastPitch = pitch;
  }

  shouldUpdate(): boolean {
    const p = this.getPos();
    const moved = p.distanceToSquared(this.lastPos) >= this.pos2;

    const { yaw, pitch } = this.getYawPitch();
    const rot =
      Math.abs(yaw - this.lastYaw) >= this.rotRad ||
      Math.abs(pitch - this.lastPitch) >= this.rotRad;

    if (moved || rot) {
      this.lastPos.copy(p);
      this.lastYaw = yaw;
      this.lastPitch = pitch;
      return true;
    }
    return false;
  }
}
