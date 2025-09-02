import assets from "assets.json";
import type { LoadingManager } from "three";
import { DRACOLoader, GLTFLoader } from "three/examples/jsm/Addons.js";

export function createGLTFLoader(loadingManager: LoadingManager): GLTFLoader {
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderConfig({ type: "wasm" });
  dracoLoader.setDecoderPath(assets.decoder);

  const gltfLoader = new GLTFLoader(loadingManager);
  gltfLoader.setDRACOLoader(dracoLoader);

  return gltfLoader;
}
