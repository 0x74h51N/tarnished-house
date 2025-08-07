import { Group, LoadingManager, Mesh, Scene } from "three";
import { spawnMeshes, crtGLTFLoader } from "./utils";
import config from "config.json";
import {
  ManagerRefs,
  ManagerType,
  SpawnableName,
  SpawnableType,
} from "./types";

export function randomMeshes({
  scene,
  loadingManager,
}: {
  scene: Scene;
  loadingManager: LoadingManager;
}): ManagerRefs {
  const gltfLoader = crtGLTFLoader({ loadingManager });
  const acc = {} as ManagerRefs;

  const spawnable = config.assets.models.spawnable as Record<
    SpawnableName,
    SpawnableType
  >;

  for (const key in spawnable) {
    const cfg = spawnable[key as SpawnableName];

    const group = new Group();
    const manager: ManagerType = { baseMeshes: [], group };

    gltfLoader.load(cfg.path, (gltf) => {
      manager.baseMeshes = gltf.scene.children as Mesh[];
      spawnMeshes({
        manager,
        opts: cfg.spawn,
      });

      scene.add(group);
    });

    acc[key as SpawnableName] = { manager, opts: cfg.spawn };
  }

  return acc;
}
