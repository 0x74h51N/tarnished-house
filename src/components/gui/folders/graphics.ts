import {
  WebGLRenderer,
  Light,
  DirectionalLight,
  PointLight,
  OrthographicCamera,
  NoToneMapping,
  LinearToneMapping,
  ReinhardToneMapping,
  CineonToneMapping,
  ACESFilmicToneMapping,
} from "three";
import { UnrealBloomPass } from "three/examples/jsm/Addons";
import { shadowDispose } from "../../../utils/_index";
import { shadowTypes } from "../../settings/settingsData";
import config from "../../../../config.json";
import GUI from "lil-gui";

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
  const shadowMapSizes = config.quality.shadowMapSizes;

  const graphicsParams = {
    toneMapping: config.scene.renderer.toneMapping,
    toneMappingExposure: config.scene.renderer.toneMappingExposure,
    shadowEnabled: config.scene.renderer.shadows.enabled,
    shadowType: config.scene.renderer.shadows.type,
    shadowMapSize: config.scene.renderer.shadows.mapSize,
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

  // Tone Mapping
  const toneMappings = {
    None: NoToneMapping,
    Linear: LinearToneMapping,
    Reinhard: ReinhardToneMapping,
    Cineon: CineonToneMapping,
    ACESFilmic: ACESFilmicToneMapping,
  };

  graphics
    .add(graphicsParams, "toneMapping", Object.keys(toneMappings))
    .name("Tone Mapping")
    .onChange((v: string) => {
      renderer.toneMapping = toneMappings[v as keyof typeof toneMappings];
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
