import { Scene, TextureLoader, PerspectiveCamera, Texture } from "three";
import { createPointParticles, createFlame } from "./utils";
import config from "config.json";
import {
  ParticleSystemRefs,
  ParticleName,
  ParticleConfigs,
  PointParticlesInterface,
  FlameParticlesInterface,
} from "./types";

interface ParticlesCreatorInterface {
  scene: Scene;
  texLoader: TextureLoader;
  camera: PerspectiveCamera;
}
function tLoader(loader: TextureLoader, path: string): Texture {
  const tex = loader.load(path);
  return tex;
}

export function particleSystem({
  scene,
  texLoader,
}: ParticlesCreatorInterface): ParticleSystemRefs {
  const configs: ParticleConfigs = config.assets
    .particles as unknown as ParticleConfigs;
  const acc = {} as ParticleSystemRefs;

  for (const name in configs) {
    const key = name as ParticleName;

    const { properties } = configs[key];
    const textures = configs[key].textures;

    const params = {
      parent: scene,
      props: properties,
      textures: Array.isArray(textures)
        ? textures.map((p) => tLoader(texLoader, p))
        : tLoader(texLoader, textures as string),
    };

    acc[key] =
      key === "flame"
        ? createFlame(params as FlameParticlesInterface)
        : createPointParticles(params as PointParticlesInterface);
  }

  return acc;
}
