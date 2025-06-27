import * as THREE from "three";
import { Sky } from "three/examples/jsm/Addons.js";

interface SkyInterface {
  scene: THREE.Scene;
  texLoader: THREE.TextureLoader;
  directionalLight: THREE.DirectionalLight;
  camera: THREE.PerspectiveCamera;
}

interface SkyReturn {
  update: () => void;
  skyUniforms: THREE.IUniform<Sky>;
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
  moonTexture.colorSpace = THREE.SRGBColorSpace;

  const emissiveMap = texLoader.load("/moon-emissive.jpg");
  emissiveMap.colorSpace = THREE.LinearSRGBColorSpace;
  const alphaMap = texLoader.load("/moon.jpg");
  alphaMap.minFilter = THREE.LinearFilter;
  alphaMap.magFilter = THREE.LinearFilter;
  alphaMap.generateMipmaps = false;
  alphaMap.colorSpace = THREE.LinearSRGBColorSpace;

  const moon = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.MeshPhysicalMaterial({
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

  const desiredAngularSize = THREE.MathUtils.degToRad(0.75);

  function updateMoonScale() {
    const d = camera.position.distanceTo(moon.position);
    const worldDiameter = 2 * d * Math.tan(desiredAngularSize);
    moon.scale.setScalar(worldDiameter);
  }

  return {
    update: updateMoonScale,
    skyUniforms: skyUniforms as unknown as THREE.Uniform<Sky>,
  };
}
