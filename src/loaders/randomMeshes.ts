import { Group, Mesh, Scene, LoadingManager } from "three";
import { createGLTFLoader } from "./utils";
import assets from "assets.json";
import {
  ManagerRefs,
  ManagerType,
  SpawnableName,
  SpawnableObjects,
} from "./types";
import { spawnInstancedMesh } from "./instanced/instancedMeshes";

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
      gltf.scene.updateMatrixWorld(true);

      manager.baseMeshes = gltf.scene.children as Mesh[];

      spawnInstancedMesh({ manager, opts: cfg.spawn });

      scene.add(manager.group);

      acc[key as SpawnableName] = { manager, opts: cfg.spawn };
    } catch (error) {
      console.error(`Failed to load ${key}:`, error);
    }
  });

  await Promise.all(promises);
  return acc;
}
