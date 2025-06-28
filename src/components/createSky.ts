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
  const sky = new Sky();
  sky.scale.setScalar(100);
  scene.add(sky);

  const skyUniforms = sky.material.uniforms;
  skyUniforms.turbidity.value = 50;
  skyUniforms.rayleigh.value = 0;
  skyUniforms.mieCoefficient.value = 0.2;
  skyUniforms.mieDirectionalG.value = 0;
  skyUniforms.sunPosition.value.set(0, -0.08, -1);

  const moonTexture = texLoader.load("/moon.jpg");
  moonTexture.colorSpace = SRGBColorSpace;

  const emissiveMap = texLoader.load("/moon-emissive.jpg");
  emissiveMap.colorSpace = LinearSRGBColorSpace;
  const alphaMap = texLoader.load("/moon.jpg");
  alphaMap.minFilter = LinearFilter;
  alphaMap.magFilter = LinearFilter;
  alphaMap.generateMipmaps = false;
  alphaMap.colorSpace = LinearSRGBColorSpace;

  const moon = new Mesh(
    new PlaneGeometry(2, 2),
    new MeshPhysicalMaterial({
      map: moonTexture,
      transparent: true,
      alphaMap,
      emissive: 0xffffff,
      emissiveMap,
      emissiveIntensity: 10,
      toneMapped: false,
    })
  );

  const moonDistance = directionalLight.position.length() * 3;
  const moonDir = directionalLight.position.clone().normalize();
  moon.position.copy(moonDir.multiplyScalar(moonDistance));
  moon.lookAt(camera.position);
  scene.add(moon);

  const desiredAngularSize = MathUtils.degToRad(0.75);

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
