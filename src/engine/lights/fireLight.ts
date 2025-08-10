import { PointLight, PointLightHelper, Scene } from "three";
import config from "config.json";
import { FireLight, MapSizeKey } from "./types";
import { animateValue } from "./utils";

export const createFireLight = (scene: Scene): FireLight => {
  const { defMapSize, mapSizes } = config.scene.renderer.shadows;
  const lightConfg = config.scene.lighting.fireLight;

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

  scene.add(light);

  const helper = new PointLightHelper(light, lightConfg.helper.size);

  //animation
  const animator = {
    update: (elapsed: number) => {
      light.intensity = animateValue(
        lightConfg.intensity,
        lightConfg.animation.intensity,
        elapsed
      );
      light.distance = animateValue(
        lightConfg.distance,
        lightConfg.animation.distance,
        elapsed
      );
      light.position.y = animateValue(
        lightConfg.position.y,
        lightConfg.animation.position,
        elapsed
      );
    },
  };

  return { light, helper, animator };
};
