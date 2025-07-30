import { Fog } from "three";
import config from "config.json";

const fogSettings = config.scene.postProcessing.fog;

export const fog = new Fog(
  fogSettings.color,
  fogSettings.near,
  fogSettings.far
);
