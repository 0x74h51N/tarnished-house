import { DRACOLoader, GLTFLoader } from "three/examples/jsm/Addons";
import { LoadingManager } from "three";
import config from "../../../../config.json";

interface CreateGLTFLoaderOptions {
  loadingManager: LoadingManager;
}

export function createGLTFLoader(options: CreateGLTFLoaderOptions): GLTFLoader {
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderConfig({ type: "js" });
  dracoLoader.setDecoderPath(config.assets.decoder);

  const gltfLoader = new GLTFLoader(options.loadingManager);
  gltfLoader.setDRACOLoader(dracoLoader);

  return gltfLoader;
}

export function crtGLTFLoader(p0: {
  loadingManager: LoadingManager;
}): GLTFLoader {
  return createGLTFLoader(p0);
}
