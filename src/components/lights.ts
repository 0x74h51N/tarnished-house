import {
  Scene,
  AmbientLight,
  PointLight,
  PointLightHelper,
  DirectionalLight,
  DirectionalLightHelper,
  CameraHelper,
} from "three";
import { params, textureQuality } from "../../config.json";

export function lights(scene: Scene) {
  // Ambient
  const ambientLight = new AmbientLight(
    params.ambientLightColor,
    params.ambientLightIntensity
  );
  scene.add(ambientLight);

  // Fire point light
  const flSettings = params.fireLight;
  const fireLight = new PointLight(
    0xffa500,
    flSettings.intensity,
    flSettings.distance,
    flSettings.decay
  );
  fireLight.castShadow = true;
  fireLight.shadow.mapSize.set(params.shadowMapSize, params.shadowMapSize);
  const { x: flX, y: flY, z: flZ } = flSettings.positions;
  fireLight.position.set(flX, flY, flZ);
  fireLight.shadow.bias = textureQuality.medium.b;
  fireLight.shadow.normalBias = textureQuality.medium.nb;
  scene.add(fireLight);

  const fireLightHelper = new PointLightHelper(fireLight, 0.2);

  // Directional
  const dlSettings = params.directionalLight;
  const directionalLight = new DirectionalLight(
    dlSettings.color,
    dlSettings.intensity
  );
  const { x: dlX, y: dlY, z: dlZ } = dlSettings.positions;
  directionalLight.position.set(dlX, dlY, dlZ);
  directionalLight.castShadow = true;

  const halfW = dlSettings.shadowCameraWidth / 2;
  const halfH = dlSettings.shadowCameraHeight / 2;
  directionalLight.shadow.camera.left = -halfW;
  directionalLight.shadow.camera.right = halfW;
  directionalLight.shadow.camera.top = halfH;
  directionalLight.shadow.camera.bottom = -halfH;
  directionalLight.shadow.camera.near = dlSettings.shadowCameraNear;
  directionalLight.shadow.camera.far = dlSettings.shadowCameraFar;
  directionalLight.shadow.camera.updateProjectionMatrix();
  directionalLight.shadow.mapSize.set(
    params.shadowMapSize,
    params.shadowMapSize
  );
  directionalLight.shadow.bias = textureQuality.medium.b;
  directionalLight.shadow.normalBias = textureQuality.medium.nb;

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
