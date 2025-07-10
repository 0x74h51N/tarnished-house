import { Scene, TextureLoader, PerspectiveCamera, SRGBColorSpace } from "three";
import { createParticles } from "../utils/_index";
import config from "../../config.json";
import { CreateParticlesInterface, CreateParticlesReturn } from "types";

interface ParticlesInterface {
  scene: Scene;
  texLoader: TextureLoader;
  camera: PerspectiveCamera;
}

export function particles({ scene, texLoader, camera }: ParticlesInterface) {
  const configs = config.assets.particles;

  return configs.reduce((acc, { name, textures = [], properties }) => {
    const params: CreateParticlesInterface = {
      parent: scene,
      camera,
      ...properties,
      textures: textures.length
        ? textures.map((path) => {
            const tex = texLoader.load(path);
            tex.colorSpace = SRGBColorSpace;
            return tex;
          })
        : null,
    };

    acc[name] = createParticles(params);
    return acc;
  }, {} as Record<string, CreateParticlesReturn>);
}
