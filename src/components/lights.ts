import {
  Scene,
  AmbientLight,
  PointLight,
  PointLightHelper,
  DirectionalLight,
  DirectionalLightHelper,
  CameraHelper,
} from "three";
import config from "../../config.json";

export function lights(scene: Scene) {
  // Ambient
  const ambientLight = new AmbientLight(
    config.scene.lighting.ambient.color,
    config.scene.lighting.ambient.intensity
  );
  scene.add(ambientLight);

  // Fire point light
  const flSettings = config.scene.lighting.fireLight;
  const fireLight = new PointLight(
    flSettings.color,
    flSettings.intensity,
    flSettings.distance,
    flSettings.decay
  );
  fireLight.castShadow = true;
  fireLight.shadow.mapSize.set(
    config.scene.renderer.shadows.mapSize,
    config.scene.renderer.shadows.mapSize
  );
  const { x: flX, y: flY, z: flZ } = flSettings.position;
  fireLight.position.set(flX, flY, flZ);
  fireLight.shadow.bias = config.quality.textureQuality.medium.bias;
  fireLight.shadow.normalBias = config.quality.textureQuality.medium.normalBias;
  scene.add(fireLight);

  const fireLightHelper = new PointLightHelper(
    fireLight,
    flSettings.helper.size
  );

  // Directional
  const dlSettings = config.scene.lighting.directional;
  const directionalLight = new DirectionalLight(
    dlSettings.color,
    dlSettings.intensity
  );
  const { x: dlX, y: dlY, z: dlZ } = dlSettings.position;
  directionalLight.position.set(dlX, dlY, dlZ);
  directionalLight.castShadow = true;

  const halfW = dlSettings.shadow.camera.width / 2;
  const halfH = dlSettings.shadow.camera.height / 2;
  directionalLight.shadow.camera.left = -halfW;
  directionalLight.shadow.camera.right = halfW;
  directionalLight.shadow.camera.top = halfH;
  directionalLight.shadow.camera.bottom = -halfH;
  directionalLight.shadow.camera.near = dlSettings.shadow.camera.near;
  directionalLight.shadow.camera.far = dlSettings.shadow.camera.far;
  directionalLight.shadow.camera.updateProjectionMatrix();
  directionalLight.shadow.mapSize.set(
    config.scene.renderer.shadows.mapSize,
    config.scene.renderer.shadows.mapSize
  );
  directionalLight.shadow.bias = config.quality.textureQuality.medium.bias;
  directionalLight.shadow.normalBias =
    config.quality.textureQuality.medium.normalBias;

  const targetPos = dlSettings.target.position;
  directionalLight.target.position.set(targetPos.x, targetPos.y, targetPos.z);
  scene.add(directionalLight.target);

  const directionalLightHelper = new DirectionalLightHelper(
    directionalLight,
    dlSettings.helper.size
  );

  const directionalLightCameraHelper = new CameraHelper(
    directionalLight.shadow.camera
  );

  scene.add(directionalLight);

  const createFireLightAnimator = () => {
    const {
      intensity: baseIntensity,
      position: { y: basePositionY },
      distance: baseDistance,
      animation: {
        intensity: { speed: iSpeed, amplitude: iAmp },
        position: { speed: pSpeed, amplitude: pAmp },
        distance: { speed: dSpeed, amplitude: dAmp },
      },
    } = flSettings;

    const animate = (
      base: number,
      speed: number,
      amplitude: number,
      elapsed: number
    ) => base + Math.sin(elapsed * speed) * amplitude;

    return {
      updateFireLight: (elapsed: number) => {
        fireLight.intensity = animate(baseIntensity, iSpeed, iAmp, elapsed);
        fireLight.position.y = animate(basePositionY, pSpeed, pAmp, elapsed);
        fireLight.distance = animate(baseDistance, dSpeed, dAmp, elapsed);
      },
    };
  };

  const fireAnimator = createFireLightAnimator();

  return {
    ambientLight,
    fireLight,
    fireLightHelper,
    directionalLight,
    directionalLightHelper,
    directionalLightCameraHelper,
    fireAnimator,
  };
}
