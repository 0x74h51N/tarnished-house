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
