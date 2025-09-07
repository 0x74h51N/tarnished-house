import assets from "assets.json";
import {
  LinearFilter,
  LinearMipmapLinearFilter,
  type LoadingManager,
  MathUtils,
  Mesh,
  type MeshStandardMaterial,
  type Object3D,
  type Scene,
  SRGBColorSpace,
  type WebGLRenderer
} from "three";
import type { GLTF } from "three/examples/jsm/Addons.js";
import { Bonfire } from "@/prefabs";
import { createGLTFLoader } from "./utils";

interface LoadAssetsInterface {
  scene: Scene;
  loadingManager: LoadingManager;
  renderer: WebGLRenderer;
}

export function loadAssets({
  scene,
  loadingManager,
  renderer
}: LoadAssetsInterface) {
  const gltfLoader = createGLTFLoader(loadingManager);

  //
  // ─── HOUSE ─────────────────────────────────────────────────────────
  //

  const houseAsset = assets.models.house;
  gltfLoader.load(houseAsset.path, (houseGLTF: GLTF) => {
    const house = houseGLTF.scene;

    const { x, y, z } = houseAsset.position;
    house.position.set(x, y, z);

    house.scale.setScalar(houseAsset.scale);

    house.traverse((child: Object3D) => {
      if (child instanceof Mesh) {
        child.castShadow = houseAsset.castShadow;
        child.receiveShadow = houseAsset.receiveShadow;
        const mat = child.material as MeshStandardMaterial;
        if (mat.map) {
          mat.map.colorSpace = SRGBColorSpace;
          mat.map.minFilter = LinearMipmapLinearFilter;
          mat.map.magFilter = LinearFilter;
          mat.map.generateMipmaps = false;
        }
        if (mat.normalMap) {
          mat.normalMap.minFilter = LinearMipmapLinearFilter;
          mat.normalMap.magFilter = LinearFilter;
        }
        mat.needsUpdate = true;
      }
    });
    house.rotateY(MathUtils.degToRad(houseAsset.rotation.y));
    scene.add(house);
  });

  //
  // ─── BONFIRE ───────────────────────────────────────────────────────
  //

  const bonfireAsset = assets.models.bonfire;
  gltfLoader.load(bonfireAsset.path, (g: GLTF) => {
    Bonfire.setTemplate(g.scene);
  });
}
