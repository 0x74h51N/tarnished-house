import type { AssetTypes } from "../types";
import {
  params,
  bushOptions,
  graveOptions,
  rootPositions,
  treeOptions,
} from "../../config.json";

import { spawnMeshes, addRoots, centerGeometryXZ } from "../utils/_index";
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
  DoubleSide,
  Mesh,
  LinearMipmapLinearFilter,
  LinearFilter,
  Group,
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
}: LoadAssetsInterface) {
  //
  //   ─── Floor ─────────────────────────────────────────────────────────
  //
  const baseColorTex = texLoader.load("./floor/textures/ground-diff.avif");
  const normalTex = texLoader.load("./floor/textures/ground-norm.avif");
  const armTex = texLoader.load("./floor/textures/ground-arm.avif");
  const displacementTex = texLoader.load("./floor/textures/ground-disp.avif");

  const floorAlphaTex = texLoader.load("./floor/alpha.jpg");

  const repeat = 14;
  baseColorTex.colorSpace = SRGBColorSpace;
  baseColorTex.repeat.set(repeat, repeat);
  baseColorTex.wrapS = RepeatWrapping;
  baseColorTex.wrapT = RepeatWrapping;

  normalTex.repeat.set(repeat, repeat);
  normalTex.wrapS = RepeatWrapping;
  normalTex.wrapT = RepeatWrapping;

  armTex.repeat.set(repeat, repeat);
  armTex.wrapS = RepeatWrapping;
  armTex.wrapT = RepeatWrapping;

  displacementTex.repeat.set(repeat, repeat);
  displacementTex.wrapS = RepeatWrapping;
  displacementTex.wrapT = RepeatWrapping;

  const floorGeometry = new PlaneGeometry(50, 50, 300, 300);
  const floorMaterial = new MeshStandardMaterial({
    alphaMap: floorAlphaTex,
    transparent: true,
    map: baseColorTex,
    normalMap: normalTex,
    aoMap: armTex,
    metalnessMap: armTex,
    roughnessMap: armTex,
    displacementMap: displacementTex,
    displacementScale: 0.1,
    side: DoubleSide,
    color: 0xcccccc,
  });

  const floor = new Mesh(floorGeometry, floorMaterial);
  floor.receiveShadow = true;
  floor.rotation.x = -Math.PI * 0.5;

  scene.add(floor);

  //
  // ─── HOUSE ─────────────────────────────────────────────────────────
  //
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderConfig({ type: "js" });
  dracoLoader.setDecoderPath(
    "https://www.gstatic.com/draco/versioned/decoders/1.5.7/"
  );

  const gltfLoader = new GLTFLoader(loadingManager);
  gltfLoader.setDRACOLoader(dracoLoader);

  gltfLoader.load("./abandoned_house/abandonedHouse.gltf", (gltf) => {
    const house = gltf.scene;
    house.position.set(0.02, 0.2, -8);
    house.scale.setScalar(1.85);
    gltf.scene.traverse((child) => {
      if (child instanceof Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
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
  // ─── TREES ────────────────────────────────────────────────────────
  //
  const treesGroup = new Group();

  const trees: AssetTypes = {
    baseMeshes: [],
    gltf: null,
    group: treesGroup,
  };

  gltfLoader.load("./trees/trees.gltf", (gltf) => {
    trees.gltf = gltf;
    trees.baseMeshes = gltf.scene.children[0].children[0].children[0]
      .children as Mesh[];
    spawnMeshes({
      baseMeshes: trees.baseMeshes,
      group: trees.group,
      count: params.treeCount,
      options: treeOptions,
    });
    scene.add(trees.group);
  });

  //
  // ─── BUSHES ────────────────────────────────────────────────────────
  //
  const bushGroup = new Group();
  const bushes: AssetTypes = {
    baseMeshes: [],
    gltf: null,
    group: bushGroup,
  };

  gltfLoader.load(
    "./burchellii/bushes.gltf",
    (gltf) => {
      bushes.gltf = gltf;
      bushes.baseMeshes = [
        gltf.scene.children[0] as Mesh,
        gltf.scene.children[1] as Mesh,
        gltf.scene.children[2] as Mesh,
      ];
      spawnMeshes({
        baseMeshes: bushes.baseMeshes,
        group: bushes.group,
        count: params.bushCount,
        options: bushOptions,
      });
      scene.add(bushes.group);
    },
    undefined,
    console.error
  );
  //
  // ─── GRAVES ───────────────────────────────────────────────────────
  //
  const graveGroup = new Group();
  const graves: AssetTypes = {
    baseMeshes: [],
    gltf: null,
    group: graveGroup,
  };

  gltfLoader.load("./gravestones/scene.gltf", (gltf) => {
    graves.gltf = gltf;
    gltf.scene.traverse((child) => {
      if (child instanceof Mesh) {
        centerGeometryXZ(child.geometry);
        child.position.set(0, 0, 0);
        child.rotation.set(0, 0, 0);
        child.rotateY(Math.PI * 0.5);
        graves.baseMeshes.push(child);
      }
    });
    spawnMeshes({
      baseMeshes: graves.baseMeshes,
      group: graves.group,
      count: params.graveCount,
      options: graveOptions,
    });
    scene.add(graves.group);
  });

  //
  //  ─── ROOTS ───────────────────────────────────────────────────────
  //

  gltfLoader.load("./pineroots/pine_roots.gltf", (gltf) => {
    const groupCount = 9;

    for (let i = 0; i < groupCount; i++) {
      const group = new Group();

      const baseAngle = Math.random() * Math.PI * 4;
      const rotA = [0, baseAngle, 0];
      const rotB = [0, baseAngle * 2, 0];

      const A = gltf.scene.children[0].clone() as Mesh;
      const B = gltf.scene.children[1].clone() as Mesh;

      addRoots({
        A,
        B,
        aPos: [...rootPositions[i % rootPositions.length]] as [
          number,
          number,
          number
        ],
        aRot: [...rotA] as [number, number, number],
        bPos: [...rootPositions[i % rootPositions.length]] as [
          number,
          number,
          number
        ],
        bRot: [...rotB] as [number, number, number],
        scale: 3,
        group,
      });
      scene.add(group);
    }
  });

  //
  // ─── BONFIRE ───────────────────────────────────────────────────────
  //

  gltfLoader.load(
    "./bonfire/bonfire.gltf",
    (g) => {
      const bonfire = g.scene.children[0];
      bonfire.traverse((child) => {
        if (child instanceof Mesh) {
          child.castShadow = true;
        }
      });

      bonfire.scale.setScalar(2.2);
      bonfire.position.set(0, 0.21, 1.5);
      bonfire.add(positionalSound);
      scene.add(bonfire);
    },
    (xhr) => {
      console.log("bonfire " + (xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    (error) => {
      console.error("An error happened", error);
    }
  );

  return {
    trees,
    bushes,
    graves,
  };
}
