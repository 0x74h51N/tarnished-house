import { SpawnableName, spawnInstancedMesh } from "@/loaders";
import { GeneralControl, SceneSettingsParams } from "..";
import assets from "assets.json";

export function makeSceneSettings({
  randomMeshes,
}: SceneSettingsParams): GeneralControl[] {
  const spawnable = assets.models.spawnable;
  const arr = [] as GeneralControl[];

  for (const k in spawnable) {
    const key = k as SpawnableName;
    const managerRef = randomMeshes[key];
    if (key.includes("grave")) continue;
    arr.push({
      type: "range",
      id: `${key}countId`,
      label: `${key}`,
      min: "1",
      max: "1250",
      step: "1",
      value: spawnable[key].spawn.count.toString(),
      span: `${key}CountValue`,
      hide: true,
      onChange: (e) => {
        const v = +e.target.value;
        document.getElementById(`${key}CountValue`)!.textContent = v.toString();
        spawnable[key].spawn.count = v;
        spawnInstancedMesh(managerRef);
      },
    });
  }
  return arr;
}
