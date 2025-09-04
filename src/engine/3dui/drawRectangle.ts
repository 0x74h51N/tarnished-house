// drawRectangle.ts
import type { CanvasTexture } from "three";
import { roundRect } from "./utils";

export type DrawRectangleParams = {
  ctx: CanvasRenderingContext2D;
  W: number;
  H: number;
  label: string;
  fontFamily: string;
  tex?: CanvasTexture;

  color?: string;
  bg?: string;
  borderWidth?: number;
  radius?: number;
  shadowColor?: string;
  shadowBlur?: number;
  labelStroke?: string;
  labelStrokeWidth?: number;
  fontSizePx?: number;
};

export function drawRectangle({
  ctx,
  W,
  H,
  label,
  fontFamily,
  tex,
  color = "#ffd700",
  bg = "rgba(12,12,16,0.72)",
  borderWidth = 6,
  radius = 16,
  shadowColor = "#000",
  shadowBlur = 8,
  labelStroke = "#2a1a00",
  labelStrokeWidth = 2,
  fontSizePx = 72
}: DrawRectangleParams) {
  ctx.clearRect(0, 0, W, H);

  ctx.fillStyle = bg;
  roundRect(ctx, 12, 12, W - 24, H - 24, radius, true, false);

  ctx.strokeStyle = color;
  ctx.lineWidth = borderWidth;
  roundRect(ctx, 12, 12, W - 24, H - 24, radius, false, true);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = shadowColor;
  ctx.shadowBlur = shadowBlur;
  ctx.fillStyle = color;
  ctx.strokeStyle = labelStroke;
  ctx.lineWidth = labelStrokeWidth;

  ctx.font = `${fontSizePx}px "${fontFamily}", serif`;
  ctx.fillText(label, W * 0.5, H * 0.52);
  ctx.strokeText(label, W * 0.5, H * 0.52);

  if (tex) tex.needsUpdate = true;
}
