import { Scene, TextureLoader, PerspectiveCamera, Texture } from "three";
import { createParticles, createFlame } from "../utils/_index";
import config from "../../config.json";
import {
  CreateParticlesInterface,
  CreateParticlesReturn,
  FlameParticlesInterface,
} from "types";

interface ParticlesInterface {
  scene: Scene;
  texLoader: TextureLoader;
  camera: PerspectiveCamera;
}
function tLoader(loader: TextureLoader, path: string): Texture {
  const tex = loader.load(path);
  return tex;
}
export function particles({ scene, texLoader }: ParticlesInterface) {
  const configs = config.assets.particles;

  return configs.reduce((acc, { name, textures, properties }) => {
    const params = {
      parent: scene,
      ...properties,
      textures: Array.isArray(textures)
        ? textures.map((p) => tLoader(texLoader, p))
        : tLoader(texLoader, textures as string),
    };
    if (name === "flame") {
      acc["flame"] = createFlame(params as FlameParticlesInterface);
    } else acc[name] = createParticles(params as CreateParticlesInterface);
    return acc;
  }, {} as Record<string, CreateParticlesReturn>);
}
