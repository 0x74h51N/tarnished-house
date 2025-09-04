import assets from "assets.json";
import {
  LinearFilter,
  LinearMipmapLinearFilter,
  type LoadingManager,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  type Object3D,
  PlaneGeometry,
  RepeatWrapping,
  type Scene,
  SRGBColorSpace,
  type TextureLoader,
  type WebGLRenderer
} from "three";
import type { GLTF } from "three/examples/jsm/Addons.js";
import { Bonfire } from "@/prefabs";
import { createGLTFLoader } from "./utils";

interface LoadAssetsInterface {
  scene: Scene;
  loadingManager: LoadingManager;
  renderer: WebGLRenderer;
  texLoader: TextureLoader;
}

export function loadAssets({
  scene,
  loadingManager,
  renderer,
  texLoader
}: LoadAssetsInterface) {
  const gltfLoader = createGLTFLoader(loadingManager);

  //
  //   ─── Floor ─────────────────────────────────────────────────────────
  //

  const floorAsset = assets.floor;
  const { repeat, ...texPaths } = floorAsset.textures;

  const textures = Object.fromEntries(
    Object.entries(texPaths).map(([key, path]) => {
      const tex = texLoader.load(path);
      if (key === "baseColor") tex.colorSpace = SRGBColorSpace;

      tex.repeat.set(repeat, repeat);
      tex.wrapS = RepeatWrapping;
      tex.wrapT = RepeatWrapping;

      return [key, tex];
    })
  );
  const floorGeometry = new PlaneGeometry(
    ...Object.values(floorAsset.geometry)
  );
  const floorMaterial = new MeshStandardMaterial({
    transparent: true,
    map: textures.baseColor,
    normalMap: textures.normalMap,
    aoMap: textures.armTex,
    metalnessMap: textures.armTex,
    roughnessMap: textures.armTex,
    displacementMap: textures.displacementMap,
    displacementScale: floorAsset.displacementScale,
    color: floorAsset.color
  });

  const floor = new Mesh(floorGeometry, floorMaterial);
  floor.name = "Floor";
  floor.userData.textures = textures;
  floor.userData.asset = floorAsset;
  floor.receiveShadow = true;
  floor.rotation.x = -Math.PI * 0.5;

  scene.add(floor);

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
        const mat = child.material;
        if (mat.map) {
          mat.map.encoding = SRGBColorSpace;
          mat.map.anisotropy = renderer.capabilities.getMaxAnisotropy();
          mat.map.minFilter = LinearMipmapLinearFilter;
          mat.map.magFilter = LinearFilter;
          mat.map.generateMipmaps = false;
        }
        if (mat.normalMap) {
          mat.normalMap.anisotropy = renderer.capabilities.getMaxAnisotropy();
          mat.normalMap.minFilter = LinearMipmapLinearFilter;
          mat.normalMap.magFilter = LinearFilter;
          mat.normalMap.generateMipmaps = false;
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
