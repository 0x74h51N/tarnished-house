import * as THREE from "three";
import { createParticles } from "../utils/_index";

interface ParticlesInterface {
  scene: THREE.Scene;
  texLoader: THREE.TextureLoader;
  camera: THREE.PerspectiveCamera;
}

export function particles({ scene, texLoader, camera }: ParticlesInterface) {
  // Flame
  const flamePath = ["fire/flame2.jpg", "fire/flame3.jpg"];
  const flameAlphaPath = ["fire/flame2-alpha.png", "fire/flame3-alpha.png"];

  const flameTextures = flamePath.map((p) =>
    texLoader.load(p, (t) => {
      t.colorSpace = THREE.SRGBColorSpace;
    })
  );

  const flame = createParticles({
    parent: scene,
    area: 0.21,
    size: 0.41,
    maxCount: 9,
    spawnRate: 17,
    startPozs: [0, 0.45, 1.5],
    textures: flameTextures,
    camera,
    opacity: 0.19,
  });

  // Smoke
  const smokePath = [
    "smoke/smoke1.png",
    "smoke/smoke2.png",
    "smoke/smoke3.png",
    "smoke/smoke4.png",
  ];
  const smokeTextures = smokePath.map((p) => texLoader.load(p));

  const smoke = createParticles({
    parent: scene,
    area: 0.2,
    size: 0.6,
    maxCount: 30,
    spawnRate: 2,
    startPozs: [0, 1.3, 1.5],
    textures: smokeTextures,
    camera,
    opacity: 0.4,
    color: 0x444444,
    sizeGrowth: 0.5,
    fadeRate: 0.05,
  });

  // Sparks
  const sparks = createParticles({
    parent: scene,
    color: "#fff",
    area: 0.3,
    size: 0.007,
    maxCount: 100,
    spawnRate: 11,
    startPozs: [0, 0.15, 1.5],
    camera,
  });

  return { flame, smoke, sparks };
}
