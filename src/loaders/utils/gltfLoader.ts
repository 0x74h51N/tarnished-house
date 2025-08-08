import { DRACOLoader, GLTFLoader } from "three/examples/jsm/Addons";
import { LoadingManager } from "three";
import config from "config.json";

export function createGLTFLoader(loadingManager: LoadingManager): GLTFLoader {
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderConfig({ type: "wasm" });
  dracoLoader.setDecoderPath(config.assets.decoder);

  const gltfLoader = new GLTFLoader(loadingManager);
  gltfLoader.setDRACOLoader(dracoLoader);

  return gltfLoader;
}
