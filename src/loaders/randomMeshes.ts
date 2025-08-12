import { Group, Mesh, Scene, LoadingManager } from "three";
import { spawnMeshes, createGLTFLoader } from "./utils";
import assets from "assets.json";
import {
  ManagerRefs,
  ManagerType,
  SpawnableName,
  SpawnableObjects,
} from "./types";

export async function randomMeshes({
  scene,
}: {
  scene: Scene;
}): Promise<ManagerRefs> {
  const acc = {} as ManagerRefs;
  const spawnable = assets.models.spawnable as SpawnableObjects;

  const randomManager = new LoadingManager();
  randomManager.onError = (u) => console.error("random failed", u);

  const loader = createGLTFLoader(randomManager);

  const promises = Object.entries(spawnable).map(async ([key, cfg]) => {
    const group = new Group();
    const manager: ManagerType = { baseMeshes: [], group };

    try {
      const gltf = await loader.loadAsync(cfg.path);
      manager.baseMeshes = gltf.scene.children as Mesh[];
      spawnMeshes({ manager, opts: cfg.spawn });
      scene.add(group);
      acc[key as SpawnableName] = { manager, opts: cfg.spawn };
    } catch (error) {
      console.error(`Failed to load ${key}:`, error);
    }
  });

  await Promise.all(promises);
  return acc;
}
