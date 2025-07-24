import { getCountConfigs, spawnMeshes } from "../../../utils/_index";
import config from "../../../../config.json";
import GUI from "lil-gui";
import { ManagerRefs } from "components/assetLoader";

export function createSceneSettings(
  gui: GUI,
  randomMeshes: ManagerRefs[]
): void {
  const sceneOptions = gui.addFolder("Scene Options");
  sceneOptions.close();

  const spawnable = config.assets.models.spawnable;
  const countCfg = getCountConfigs(randomMeshes, spawnable);

  (Object.keys(countCfg) as Array<keyof typeof spawnable>).forEach((key) => {
    const { manager, opts } = countCfg[key];

    sceneOptions
      .add(spawnable[key], "count", 1, 150, 1)
      .name(`${key} Count`)
      .onChange((value: number) => {
        spawnMeshes({
          baseMeshes: manager.baseMeshes,
          group: manager.group,
          count: value,
          options: opts,
          roots: key.includes("root"),
        });
      });
  });
}
