import type { InstancedMesh2 } from "@three.ez/instanced-mesh";
import assets from "assets.json";
import { LoadingManager, type Mesh, type Scene } from "three";
import { spawnInstancedMesh } from "./instanced/instancedMeshes";
import type {
  ManagerRefs,
  ManagerType,
  SpawnableName,
  SpawnableObjects
} from "./types";
import { createGLTFLoader } from "./utils";

export async function randomMeshes({
  scene
}: {
  scene: Scene;
}): Promise<ManagerRefs> {
  const acc = {} as ManagerRefs;
  const spawnable = assets.models.spawnable as SpawnableObjects;

  const randomManager = new LoadingManager();
  randomManager.onError = (u) => console.error("random failed", u);

  const loader = createGLTFLoader(randomManager);

  const promises = Object.entries(spawnable).map(async ([key, cfg]) => {
    const sets: InstancedMesh2[] = [];

    const manager: ManagerType = {
      baseMeshes: [],
      sets,
      tr: []
    };

    try {
      const gltf = await loader.loadAsync(cfg.path);
      gltf.scene.updateMatrixWorld(true);

      manager.baseMeshes = gltf.scene.children as Mesh[];

      spawnInstancedMesh({ manager, opts: cfg.spawn });

      manager.sets.every((g) => scene.add(g));

      acc[key as SpawnableName] = { manager, opts: cfg.spawn };
    } catch (error) {
      console.error(`Failed to load ${key}:`, error);
    }
  });

  await Promise.all(promises);
  return acc;
}
