import type { AssetTypes, ManagerTypes } from "../types";
import config from "../../config.json";
import { spawnMeshes, centerGeometryXZ } from "../utils/_index";
import { DRACOLoader, GLTFLoader } from "three/examples/jsm/Addons";
import {
  Scene,
  LoadingManager,
  WebGLRenderer,
  PositionalAudio,
  TextureLoader,
  SRGBColorSpace,
  RepeatWrapping,
  PlaneGeometry,
  MeshStandardMaterial,
  Mesh,
  LinearMipmapLinearFilter,
  LinearFilter,
  Group,
  Object3D,
} from "three";

interface LoadAssetsInterface {
  scene: Scene;
  loadingManager: LoadingManager;
  renderer: WebGLRenderer;
  positionalSound: PositionalAudio;
  texLoader: TextureLoader;
}

export function loadAssets({
  scene,
  loadingManager,
  renderer,
  positionalSound,
  texLoader,
}: LoadAssetsInterface): { managers: ManagerTypes[]; floor: Mesh } {
  //
  // ─── LOAD ASSETS ───────────────────────────────────────────────────────
  //

  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderConfig({ type: "js" });
  dracoLoader.setDecoderPath(config.assets.decoder);

  const gltfLoader = new GLTFLoader(loadingManager);
  gltfLoader.setDRACOLoader(dracoLoader);

  //
  //   ─── Floor ─────────────────────────────────────────────────────────
  //

  const floorAsset = config.assets.floor;
  const { repeat, ...texPaths } = floorAsset.textures;

  const textures = Object.fromEntries(
    Object.entries(texPaths).map(([key, path]) => {
      const tex = texLoader.load(path);
      if (key === "baseColor") tex.colorSpace = SRGBColorSpace;
      if (key !== "alphaMap") {
        tex.repeat.set(repeat, repeat);
        tex.wrapS = RepeatWrapping;
        tex.wrapT = RepeatWrapping;
      }
      return [key, tex];
    })
  );
  const floorGeometry = new PlaneGeometry(
    ...Object.values(floorAsset.geometry)
  );
  const floorMaterial = new MeshStandardMaterial({
    alphaMap: textures.alphaMap,
    transparent: true,
    map: textures.baseColor,
    normalMap: textures.normalMap,
    aoMap: textures.armTex,
    metalnessMap: textures.armTex,
    roughnessMap: textures.armTex,
    displacementMap: textures.displacementMap,
    displacementScale: floorAsset.displacementScale,
    color: floorAsset.color,
  });

  const floor = new Mesh(floorGeometry, floorMaterial);
  floor.receiveShadow = true;
  floor.rotation.x = -Math.PI * 0.5;

  scene.add(floor);

  //
  // ─── HOUSE ─────────────────────────────────────────────────────────
  //

  const houseAsset = config.assets.models.house;
  gltfLoader.load(houseAsset.path, (houseGLTF) => {
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
    scene.add(house);
  });

  //
  // ─── BONFIRE ───────────────────────────────────────────────────────
  //

  const bonfireAsset = config.assets.models.bonfire;
  gltfLoader.load(bonfireAsset.path, (bonfireGLTF) => {
    const bonfire = bonfireGLTF.scene.children[0];
    bonfire.traverse((child) => {
      if (child instanceof Mesh) {
        child.castShadow = bonfireAsset.castShadow;
      }
    });

    bonfire.scale.setScalar(bonfireAsset.scale);
    const { x, y, z } = bonfireAsset.position;
    bonfire.position.set(x, y, z);
    bonfire.add(positionalSound);
    scene.add(bonfire);
  });

  //
  // ─── Random Meshes ─────────────────────────────────────────────
  //

  const spawnKeys = ["trees", "bushes", "graves", "roots"] as const;

  const managers: ManagerTypes[] = [];

  spawnKeys.forEach((key) => {
    const cfg = config.assets.models.spawnable[key];

    const group = new Group();
    const manager: AssetTypes = { baseMeshes: [] as Mesh[], group };

    gltfLoader.load(cfg.path, (gltf) => {
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

    managers.push({ name: key, manager });
  });

  return { managers, floor };
}
