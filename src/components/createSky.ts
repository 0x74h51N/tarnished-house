import {
  Scene,
  TextureLoader,
  DirectionalLight,
  PerspectiveCamera,
  IUniform,
  SRGBColorSpace,
  LinearSRGBColorSpace,
  LinearFilter,
  Mesh,
  PlaneGeometry,
  MeshPhysicalMaterial,
  MathUtils,
  Uniform,
} from "three";
import { Sky } from "three/examples/jsm/Addons";
import config from "../../config.json";

interface SkyInterface {
  scene: Scene;
  texLoader: TextureLoader;
  directionalLight: DirectionalLight;
  camera: PerspectiveCamera;
}

interface SkyReturn {
  update: () => void;
  skyUniforms: IUniform<Sky>;
}

export function createSky({
  scene,
  texLoader,
  directionalLight,
  camera,
}: SkyInterface): SkyReturn {
  const skyConfig = config.scene.environment.sky;
  const moonConfig = config.scene.environment.moon;

  const sky = new Sky();
  sky.scale.setScalar(skyConfig.scale);
  scene.add(sky);

  const skyUniforms = sky.material.uniforms;
  skyUniforms.turbidity.value = skyConfig.turbidity;
  skyUniforms.rayleigh.value = skyConfig.rayleigh;
  skyUniforms.mieCoefficient.value = skyConfig.mieCoefficient;
  skyUniforms.mieDirectionalG.value = skyConfig.mieDirectionalG;
  skyUniforms.sunPosition.value.set(
    skyConfig.sunPosition.x,
    skyConfig.sunPosition.y,
    skyConfig.sunPosition.z
  );

  const moonTexture = texLoader.load(config.assets.moon.texture);
  moonTexture.colorSpace = SRGBColorSpace;

  const emissiveMap = texLoader.load(config.assets.moon.emissive);
  emissiveMap.colorSpace = LinearSRGBColorSpace;
  const alphaMap = texLoader.load(config.assets.moon.texture);
  alphaMap.minFilter = LinearFilter;
  alphaMap.magFilter = LinearFilter;
  alphaMap.generateMipmaps = false;
  alphaMap.colorSpace = LinearSRGBColorSpace;

  const moon = new Mesh(
    new PlaneGeometry(moonConfig.geometry.width, moonConfig.geometry.height),
    new MeshPhysicalMaterial({
      map: moonTexture,
      transparent: true,
      alphaMap,
      emissive: 0xffffff,
      emissiveMap,
      emissiveIntensity: moonConfig.emissiveIntensity,
      toneMapped: false,
    })
  );

  const moonDistance =
    directionalLight.position.length() * moonConfig.distanceMultiplier;
  const moonDir = directionalLight.position.clone().normalize();
  moon.position.copy(moonDir.multiplyScalar(moonDistance));
  moon.lookAt(camera.position);
  scene.add(moon);

  const desiredAngularSize = MathUtils.degToRad(moonConfig.angularSize);

  function updateMoonScale() {
    const d = camera.position.distanceTo(moon.position);
    const worldDiameter = 2 * d * Math.tan(desiredAngularSize);
    moon.scale.setScalar(worldDiameter);
  }

  return {
    update: updateMoonScale,
    skyUniforms: skyUniforms as unknown as Uniform<Sky>,
  };
}
