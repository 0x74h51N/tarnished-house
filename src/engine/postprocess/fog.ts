import config from "config.json";
import { Fog } from "three";
import type { QualityKeys } from "@/types/global.types";
import { camCnfg } from "../camController";

const fogSettings = config.scene.postProcessing.fog;
const far =
  camCnfg.camFar[camCnfg.defFar as QualityKeys] * fogSettings.farRatio;

export const fog = new Fog(fogSettings.color, fogSettings.near, far);
