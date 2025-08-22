import {
  CameraHelper,
  DirectionalLight,
  DirectionalLightHelper,
  Scene,
} from "three";
import config from "config.json";
import { MapSizeKey } from "@/types/global.types";
import { DirectLight } from "./types";

export function createDirectLight(scene: Scene): DirectLight {
  const shadowConfg = config.scene.renderer.shadows;
  const {
    renderer: {
      shadows: { defMapSize, defDistance, mapSizes },
    },
    lighting: {
      directional: {
        enabled,
        color,
        intensity: baseIntensity,
        position: { x: posX, y: posY, z: posZ },
        shadow: {
          camera: { near: camNear },
        },
        helper: { size: helperSize },
        target: {
          position: { x: targetX, y: targetY, z: targetZ },
        },
      },
    },
  } = config.scene;

  const light = new DirectionalLight(color, baseIntensity);
  light.position.set(posX, posY, posZ);
  light.castShadow = enabled;

  const {
    height: camHeight,
    width: camWidth,
    far: camFar,
  } = shadowConfg.distance[defDistance as keyof typeof shadowConfg.distance];

  const halfW = camWidth / 2;
  const halfH = camHeight / 2;

  Object.assign(light.shadow.camera, {
    left: -halfW,
    right: halfW,
    top: halfH,
    bottom: -halfH,
    near: camNear,
    far: camFar,
  });

  light.shadow.camera.updateProjectionMatrix();
  light.shadow.mapSize.set(defMapSize, defMapSize);
  light.shadow.bias = mapSizes[defMapSize.toString() as MapSizeKey].bias.high;
  light.shadow.normalBias =
    mapSizes[defMapSize.toString() as MapSizeKey].bias.normal;

  light.target.position.set(targetX, targetY, targetZ);
  scene.add(light.target);

  const helper = new DirectionalLightHelper(light, helperSize);
  const cameraHelper = new CameraHelper(light.shadow.camera);
  enabled && scene.add(light);

  return {
    light,
    helper,
    cameraHelper,
  };
}
