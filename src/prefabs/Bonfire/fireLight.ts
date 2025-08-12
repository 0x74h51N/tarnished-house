import { PointLight, PointLightHelper } from "three";
import config from "config.json";
import assets from "assets.json";
import { animateValue } from "../../engine/lights/utils";
import { MapSizeKey } from "@/types";
import { FireLight } from "./types";

export const createFireLight = (): FireLight => {
  const { defMapSize, mapSizes } = config.scene.renderer.shadows;
  const lightConfg = assets.models.bonfire.fireLight;

  const light = new PointLight(
    lightConfg.color,
    lightConfg.intensity,
    lightConfg.distance,
    lightConfg.decay
  );

  light.castShadow = true;
  light.shadow.mapSize.set(defMapSize, defMapSize);
  light.shadow.bias = mapSizes[defMapSize.toString() as MapSizeKey].bias.high;
  light.shadow.normalBias =
    mapSizes[defMapSize.toString() as MapSizeKey].bias.normal;

  light.position.set(
    lightConfg.position.x,
    lightConfg.position.y,
    lightConfg.position.z
  );

  const helper = new PointLightHelper(light, lightConfg.helper.size);

  //animation
  const animator = {
    update: (e: number) => {
      light.intensity = animateValue(
        lightConfg.intensity,
        lightConfg.animation.intensity,
        e
      );
      light.distance = animateValue(
        lightConfg.distance,
        lightConfg.animation.distance,
        e
      );
      light.position.y = animateValue(
        lightConfg.position.y,
        lightConfg.animation.position,
        e
      );
    },
  };

  return { light, helper, animator };
};
