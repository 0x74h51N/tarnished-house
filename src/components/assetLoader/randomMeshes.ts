import { Group, LoadingManager, Mesh, Object3D, Scene } from "three";
import type { GLTF } from "three/examples/jsm/Addons";
import { centerGeometryXZ } from "../../utils/_index";
import { spawnMeshes, crtGLTFLoader } from "./utils";
import config from "../../../config.json";
import { AssetTypes, ManagerTypes, SpawnableName } from "./types";

export function randomMeshes({
  scene,
  loadingManager,
}: {
  scene: Scene;
  loadingManager: LoadingManager;
}): { managers: ManagerTypes[] } {
  const gltfLoader = crtGLTFLoader({ loadingManager });
  const managers: ManagerTypes[] = [];

  Object.entries(config.assets.models.spawnable).forEach(([key, cfg]) => {
    const group = new Group();
    const manager: AssetTypes = { baseMeshes: [] as Mesh[], group };

    gltfLoader.load(cfg.path, (gltf: GLTF) => {
      let rawMeshes: Mesh[] = [];

      switch (key) {
        case "trees":
          rawMeshes = gltf.scene.children[0].children[0].children[0]
            .children as Mesh[];
          break;

        case "graves":
          gltf.scene.traverse((child: Object3D) => {
            if (child instanceof Mesh) {
              centerGeometryXZ(child.geometry);
              child.rotateY(Math.PI * 0.5);
              rawMeshes.push(child);
            }
          });
          break;

        default:
          rawMeshes = gltf.scene.children as Mesh[];
          break;
      }

      manager.baseMeshes = rawMeshes;

      spawnMeshes({
        baseMeshes: rawMeshes,
        group,
        count: cfg.count,
        options: {
          scaleMin: cfg.spawn.scale.min,
          scaleMax: cfg.spawn.scale.max,
          radiusMin: cfg.spawn.radius.min,
          radiusMax: cfg.spawn.radius.max,
          minDistance: cfg.spawn.minDistance,
        },
        roots: key === "roots",
      });

      scene.add(group);
    });

    managers.push({ name: key as SpawnableName, manager });
  });

  return { managers };
}
