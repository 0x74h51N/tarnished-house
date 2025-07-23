import { getCountConfigs, spawnMeshes } from "../../../utils/_index";
import { makeScene } from "../../settings/settingsData";
import config from "../../../../config.json";
import GUI from "lil-gui";
import { ManagerTypes } from "components/assetLoader";

export function createSceneSettings(gui: GUI, gltfAssets: ManagerTypes[]) {
  const sceneOptions = gui.addFolder("Scene Options");
  sceneOptions.close();

  const assets = config.assets;
  const map = getCountConfigs(gltfAssets, assets.models.spawnable);

  makeScene().forEach((control) => {
    if (control.type === "range") {
      const { id, label, min, max, step } = control;
      const cfg = map[id as `${ManagerTypes["name"]}Count`];
      if (!cfg) return;

      sceneOptions
        .add(
          assets.models.spawnable[
            id.replace("Count", "") as ManagerTypes["name"]
          ],
          "count",
          min,
          max,
          step
        )
        .name(label)
        .onChange((val: number) => {
          const { manager, opts } = cfg;

          spawnMeshes({
            baseMeshes: manager.baseMeshes,
            group: manager.group,
            count: val,
            options: opts,
            roots: id === "roots",
          });
        });
    }
  });
}
