import assets from "assets.json";
import GUI from "lil-gui";
import { ManagerRefs, SpawnableName } from "@/loaders";
import { spawnMeshes } from "@/loaders/utils";
import {
  MeshStandardMaterial,
  PlaneGeometry,
  Texture,
  BufferAttribute,
  RepeatWrapping,
  Scene,
  Mesh,
} from "three";

type FloorMesh = Mesh<PlaneGeometry, MeshStandardMaterial>;

export function createSceneSettings(
  gui: GUI,
  randomMeshes: ManagerRefs,
  scene: Scene
): void {
  const sceneOptions = gui.addFolder("Scene Options");
  sceneOptions.close();

  const randomization = sceneOptions.addFolder("Random Meshes");
  const spawnable = assets.models.spawnable;

  for (const k in spawnable) {
    const key = k as SpawnableName;
    const managerRef = randomMeshes[key];

    const f = randomization.addFolder(key);
    f.close();
    f.add(spawnable[key].spawn, "count", 1, 10000, 1)
      .name("Count")
      .onChange(() => spawnMeshes(managerRef));

    f.add(spawnable[key].spawn.radius, "min", 1, 1000, 1).name("Min Radius");
    f.add(spawnable[key].spawn.radius, "max", 1, 1000, 1).name("Max Radius");
  }

  const floor = scene.getObjectByName("Floor") as FloorMesh | null;
  if (
    !floor ||
    !(floor.material instanceof MeshStandardMaterial) ||
    !(floor.geometry instanceof PlaneGeometry)
  ) {
    console.warn("[GUI] Floor not found or invalid type");
    return;
  }

  const asset = floor.userData.asset;
  const tex = floor.userData.textures as Record<string, Texture>;

  const folder = sceneOptions.addFolder("Floor");
  folder.close();

  function rebuildGeometry() {
    const g = new PlaneGeometry(
      asset.geometry.width,
      asset.geometry.height,
      Math.max(1, Math.floor(asset.geometry.widthSegments)),
      Math.max(1, Math.floor(asset.geometry.heightSegments))
    );
    g.setAttribute("uv2", (g.getAttribute("uv") as BufferAttribute).clone());

    floor!.geometry.dispose();
    floor!.geometry = g;
    floor!.rotation.x = -Math.PI * 0.5;
  }

  function applyRepeat() {
    Object.values(tex).forEach((t) => {
      t.repeat.set(asset.textures.repeat, asset.textures.repeat);
      t.wrapS = RepeatWrapping;
      t.wrapT = RepeatWrapping;
      t.needsUpdate = true;
    });
  }

  folder
    .add(asset.geometry, "width", 10, 2000, 1)
    .name("Width")
    .onFinishChange(rebuildGeometry);
  folder
    .add(asset.geometry, "height", 10, 2000, 1)
    .name("Height")
    .onFinishChange(rebuildGeometry);
  folder
    .add(asset.geometry, "widthSegments", 1, 2048, 1)
    .name("Width Segs")
    .onFinishChange(rebuildGeometry);
  folder
    .add(asset.geometry, "heightSegments", 1, 2048, 1)
    .name("Height Segs")
    .onFinishChange(rebuildGeometry);

  folder
    .add(floor.material, "displacementScale", 0, 1, 0.005)
    .name("Displacement")
    .onChange((v: number) => {
      asset.displacementScale = v;
      floor.material.needsUpdate = true;
    });

  folder
    .add(asset.textures, "repeat", 1, 128, 1)
    .name("Repeat")
    .onFinishChange(applyRepeat);

  folder.add(floor.scale, "x", 0.01, 10, 0.01).name("Scale X");
  folder.add(floor.scale, "y", 0.01, 10, 0.01).name("Scale Y");
  folder.add(floor.scale, "z", 0.01, 10, 0.01).name("Scale Z");

  folder
    .addColor(asset, "color")
    .name("Color")
    .onChange((v: string) => {
      floor.material.color.set(v);
      floor.material.needsUpdate = true;
    });

  folder
    .add(floor.material, "wireframe")
    .name("Wireframe")
    .onChange(() => (floor.material.needsUpdate = true));
  folder.add(floor, "receiveShadow").name("Receive Shadow");

  applyRepeat();
}
