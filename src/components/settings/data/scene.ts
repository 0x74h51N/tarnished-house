import { SpawnableName } from "@/loaders";
import { spawnMeshes } from "@/loaders/utils";
import { GeneralControl, SceneSettingsParams } from "..";
import config from "config.json";

export function makeSceneSettings({
  randomMeshes,
}: SceneSettingsParams): GeneralControl[] {
  const spawnable = config.assets.models.spawnable;
  const arr = [] as GeneralControl[];

  for (const k in spawnable) {
    const key = k as SpawnableName;
    const managerRef = randomMeshes[key];
    arr.push({
      type: "range",
      id: `${key}countId`,
      label: `${key} Count`,
      min: "1",
      max: "150",
      step: "1",
      value: spawnable[key].spawn.count.toString(),
      span: `${key}CountValue`,
      onChange: (e) => {
        const v = +e.target.value;
        document.getElementById(`${key}CountValue`)!.textContent = v.toString();
        spawnable[key].spawn.count = v;
        spawnMeshes(managerRef);
      },
    });
  }
  return arr;
}
