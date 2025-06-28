import {
  Scene,
  AmbientLight,
  PointLight,
  PointLightHelper,
  DirectionalLight,
  DirectionalLightHelper,
  CameraHelper,
} from "three";
import { params } from "../../config.json";

export function lights(scene: Scene) {
  // Ambient
  const ambientLight = new AmbientLight(
    params.ambientLightColor,
    params.ambientLightIntensity
  );
  scene.add(ambientLight);

  // Fire point light
  const fireLight = new PointLight(
    0xffa500,
    params.fireLightIntensity,
    params.fireLightDistance,
    params.fireLightDecay
  );
  fireLight.castShadow = true;
  fireLight.shadow.mapSize.set(params.shadowMapSize, params.shadowMapSize);
  fireLight.position.set(0, params.fireLightY, 1.5);
  fireLight.shadow.bias = params.shadowBias;
  fireLight.shadow.normalBias = params.shadowNormalBias;
  scene.add(fireLight);

  const fireLightHelper = new PointLightHelper(fireLight, 0.2);

  // Directional
  const directionalLight = new DirectionalLight(
    params.directionalLightColor,
    params.directionalLightIntensity
  );
  directionalLight.position.set(
    params.directionalLightX,
    params.directionalLightY,
    params.directionalLightZ
  );
  directionalLight.castShadow = true;

  const halfW = params.shadowCameraWidth / 2;
  const halfH = params.shadowCameraHeight / 2;
  directionalLight.shadow.camera.left = -halfW;
  directionalLight.shadow.camera.right = halfW;
  directionalLight.shadow.camera.top = halfH;
  directionalLight.shadow.camera.bottom = -halfH;
  directionalLight.shadow.camera.near = params.shadowCameraNear;
  directionalLight.shadow.camera.far = params.shadowCameraFar;
  directionalLight.shadow.camera.updateProjectionMatrix();

  directionalLight.shadow.bias = params.shadowBias;
  directionalLight.shadow.normalBias = params.shadowNormalBias;

  directionalLight.target.position.set(0, 0, 0);
  scene.add(directionalLight.target);

  const directionalLightHelper = new DirectionalLightHelper(
    directionalLight,
    1
  );

  const directionalLightCameraHelper = new CameraHelper(
    directionalLight.shadow.camera
  );

  scene.add(directionalLight);

  return {
    ambientLight,
    fireLight,
    fireLightHelper,
    directionalLight,
    directionalLightHelper,
    directionalLightCameraHelper,
  };
}
