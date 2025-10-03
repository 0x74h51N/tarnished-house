import { InstancedMesh2 } from "@three.ez/instanced-mesh";
import config from "config.json";
import {
  BufferAttribute,
  MeshStandardMaterial,
  PlaneGeometry,
  RepeatWrapping,
  type Scene,
  SRGBColorSpace,
  type TextureLoader,
  type WebGLRenderer
} from "three";
import type { lodKeys } from "@/types/global.types";
import { type TQKey, terrainCnf } from ".";
import { addTiles, makeTile } from "./utils";

export function createTerrain({
  texLoader,
  scene,
  renderer,
  quality,
  lodKey
}: {
  texLoader: TextureLoader | MeshStandardMaterial;
  scene: Scene;
  renderer: WebGLRenderer;
  quality?: TQKey;
  lodKey?: lodKeys;
}): InstancedMesh2 {
  const lodCnf = config.scene.renderer.lods;

  const lodDists = Object.values(
    lodCnf[lodKey ?? (config.scene.renderer.defLod as lodKeys)]
  ) as number[];

  let baseMat: MeshStandardMaterial;

  if (texLoader instanceof MeshStandardMaterial) baseMat = texLoader.clone();
  else {
    const textures = Object.fromEntries(
      Object.entries(terrainCnf.textures).map(([key, path]) => {
        const tex = texLoader.load(path);
        if (key === "baseColor") tex.colorSpace = SRGBColorSpace;

        tex.repeat.set(terrainCnf.repeat, terrainCnf.repeat);
        tex.wrapS = RepeatWrapping;
        tex.wrapT = RepeatWrapping;

        return [key, tex];
      })
    );

    baseMat = new MeshStandardMaterial({
      transparent: true,
      map: textures.baseColor,
      normalMap: textures.normalMap,
      aoMap: textures.armTex,
      metalnessMap: textures.armTex,
      roughnessMap: textures.armTex,
      displacementMap: textures.displacementMap,
      displacementScale: terrainCnf.displacementScale,
      color: terrainCnf.color
    });
  }
  const qKey = quality ?? (terrainCnf.defQuality as TQKey);
  const terrain = terrainCnf.quality[qKey];

  const gCnf = terrain.geometry;
  const geo = new PlaneGeometry(...Object.values(gCnf)).rotateX(-Math.PI / 2);
  if (!geo.attributes.uv2) {
    geo.setAttribute("uv2", new BufferAttribute(geo.attributes.uv.array, 2));
  }

  const inst = new InstancedMesh2(geo, baseMat, { renderer });

  const lods = terrain.LOD;
  Object.values(lods).forEach((l, i) => {
    const lMat = baseMat.clone();
    if (i < 2) lMat.displacementScale = terrainCnf.displacementScale;

    const lGeo = makeTile(gCnf, l);
    if (!lGeo.attributes.uv2) {
      lGeo.setAttribute(
        "uv2",
        new BufferAttribute(lGeo.attributes.uv.array, 2)
      );
    }

    inst.addLOD(lGeo, lMat, lodDists[i]);
    inst.addShadowLOD(lGeo, lodDists[i]);
  });

  inst.name = "terrain";
  inst.castShadow = false;
  inst.receiveShadow = true;
  addTiles(inst, terrainCnf.tileCount, gCnf.width, gCnf.height);
  inst.position.y = -0.045;
  inst.computeBVH();
  scene.add(inst);

  return inst;
}
