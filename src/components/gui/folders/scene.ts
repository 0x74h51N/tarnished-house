import config from "config.json";
import GUI from "lil-gui";
import { ManagerRefs, SpawnableName } from "@/loaders";
import { spawnMeshes } from "@/loaders/utils";

export function createSceneSettings(gui: GUI, randomMeshes: ManagerRefs): void {
  const sceneOptions = gui.addFolder("Scene Options");
  sceneOptions.close();

  const spawnable = config.assets.models.spawnable;

  for (const k in spawnable) {
    const key = k as SpawnableName;
    const managerRef = randomMeshes[key];
    sceneOptions
      .add(spawnable[key].spawn, "count", 1, 150, 1)
      .name(`${key} Count`)
      .onChange(() => {
        spawnMeshes(managerRef);
      });
  }
}
