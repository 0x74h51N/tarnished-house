import {
  WebGLRenderer,
  Light,
  DirectionalLight,
  PointLight,
  OrthographicCamera,
} from "three";
import { UnrealBloomPass } from "three/examples/jsm/Addons";
import { shadowDispose } from "../../../utils/_index";
import config from "../../../../config.json";
import GUI from "lil-gui";
import { shadowTypes, toneMappingMap } from "../../settings";

export function createGraphicsSettings(
  gui: GUI,
  renderer: WebGLRenderer,
  lights: Light[],
  bloomPass: UnrealBloomPass,
  antialias: boolean
) {
  const [fireLight, directionalLight] = lights as [
    PointLight,
    DirectionalLight
  ];
  const shadowConfg = config.scene.renderer.shadows;
  const shadowMapSizes = shadowConfg.mapSizes;

  const graphicsParams = {
    toneMapping: config.scene.renderer.toneMapping,
    toneMappingExposure: config.scene.renderer.toneMappingExposure,
    shadowEnabled: shadowConfg.enabled,
    shadowType: shadowConfg.type,
    shadowMapSize: shadowMapSizes,
    bloomParams: config.scene.postProcessing.bloom,
  };

  const antialiasObj = { antialias };

  const graphics = gui.addFolder("Graphics Settings");
  graphics.close();

  // Antialiasing
  graphics
    .add(antialiasObj, "antialias")
    .name("Antialiasing")
    .onFinishChange(() => {
      localStorage.setItem("antialias", String(antialiasObj.antialias));
      location.reload();
    });

  graphics
    .add(graphicsParams, "toneMapping", Object.keys(toneMappingMap))
    .name("Tone Mapping")
    .onChange((v: string) => {
      renderer.toneMapping = toneMappingMap[v as keyof typeof toneMappingMap];
      renderer.toneMappingExposure = graphicsParams.toneMappingExposure || 1;
    });

  graphics
    .add(graphicsParams, "toneMappingExposure", 0, 2, 0.01)
    .name("Tone Exposure")
    .onChange((v: number) => {
      renderer.toneMappingExposure = v;
    });

  // Bloom
  const bloom = graphics.addFolder("Bloom");
  bloom.close();
  const bloomParams = graphicsParams.bloomParams;
  bloom.add(bloomParams, "enabled").name("Enable Bloom");
  bloom
    .add(bloomParams, "strength", 0, 5)
    .onChange((v: number) => (bloomPass.strength = v));
  bloom
    .add(bloomParams, "radius", 0, 4)
    .onChange((v: number) => (bloomPass.radius = v));
  bloom
    .add(bloomParams, "threshold", 0, 10)
    .onChange((v: number) => (bloomPass.threshold = v));

  // Shadows
  const shadows = graphics.addFolder("Shadows");
  shadows.close();

  const shadowBias = shadowConfg.bias;

  shadows
    .add(shadowBias, "high", -0.005, 0.005, 0.0001)
    .name("Shadow Bias")
    .onChange((v: number) => {
      if (fireLight.shadow) {
        fireLight.shadow.bias = v;
        directionalLight.shadow.bias = v;
      }
    });

  shadows
    .add(shadowBias, "normal", 0.0, 0.5, 0.0005)
    .name("Normal Bias")
    .onChange((v: number) => {
      if (fireLight.shadow) {
        fireLight.shadow.normalBias = v;
        directionalLight.shadow.normalBias = v;
      }
    });

  shadows
    .add(graphicsParams, "shadowEnabled")
    .name("Shadow Enabled")
    .onChange((v: boolean) => {
      renderer.shadowMap.enabled = v;
      shadowDispose(lights);
      directionalLight.castShadow = v;
      if (directionalLight.shadow && "camera" in directionalLight.shadow) {
        (directionalLight.shadow.camera as OrthographicCamera).visible = v;
        renderer.shadowMap.needsUpdate = true;
      }
    });

  shadows
    .add(graphicsParams, "shadowType", Object.keys(shadowTypes))
    .name("Shadow Type")
    .onChange((v: string) => {
      shadowDispose(lights);
      renderer.shadowMap.type = shadowTypes[v as keyof typeof shadowTypes];
      renderer.shadowMap.needsUpdate = true;
    });

  shadows
    .add(graphicsParams, "shadowMapSize", shadowMapSizes)
    .name("Shadow Resolution")
    .onChange((v: number) => {
      shadowDispose(lights);
      if (fireLight.shadow) {
        fireLight.shadow.mapSize.set(Number(v), Number(v));
      }
      if (directionalLight.shadow) {
        directionalLight.shadow.mapSize.set(Number(v), Number(v));
      }
      renderer.shadowMap.needsUpdate = true;
    });
}
