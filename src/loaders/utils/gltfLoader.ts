import { DRACOLoader, GLTFLoader } from "three/examples/jsm/Addons";
import type { LoadingManager } from "three";
import assets from "assets.json";

export function createGLTFLoader(loadingManager: LoadingManager): GLTFLoader {
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderConfig({ type: "wasm" });
  dracoLoader.setDecoderPath(assets.decoder);

  const gltfLoader = new GLTFLoader(loadingManager);
  gltfLoader.setDRACOLoader(dracoLoader);

  return gltfLoader;
}
