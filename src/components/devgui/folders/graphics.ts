import config from "config.json";
import type GUI from "lil-gui";
import type { Light, Scene, WebGLRenderer } from "three";
import type { UnrealBloomPass } from "three/examples/jsm/Addons.js";
import type { LightBundle } from "@/engine";
import {
  applyShadowSizeAndBias,
  createShadowBiasProxy
} from "@/engine/lights/utils";
import {
  type QualityKeys,
  type ToneMappingKey,
  toneMappingMap
} from "@/types/global.types";
import { allMatUpdt, shadowDispose } from "@/utils";
import type { SetupGUIInterface } from "../types";

export function createGraphicsSettings(
  gui: GUI,
  renderer: WebGLRenderer,
  lights: LightBundle,
  bloomPass: UnrealBloomPass,
  antialias: boolean,
  scene: Scene,
  syncBloom: SetupGUIInterface["syncBloom"]
) {
  const shadowConfg = config.scene.renderer.shadows;
  const shadowMapSizes = shadowConfg.mapSizes;

  const graphicsParams = {
    toneMapping: config.scene.renderer.toneMapping,
    toneMappingExposure: config.scene.renderer.toneMappingExposure,
    shadowEnabled: shadowConfg.enabled,
    shadowType: shadowConfg.type,
    shadowMapSize: shadowMapSizes,
    bloomParams: config.scene.postProcessing.bloom
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
      renderer.toneMapping = toneMappingMap[v as ToneMappingKey];
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
  bloom
    .add(bloomParams, "enabled")
    .name("Enable Bloom")
    .onChange(() => syncBloom());
  bloom.add(bloomParams, "strength", 0, 5).onChange((v: number) => {
    bloomPass.strength = v;
  });
  bloom.add(bloomParams, "radius", 0, 4).onChange((v: number) => {
    bloomPass.radius = v;
  });
  bloom.add(bloomParams, "threshold", 0, 10).onChange((v: number) => {
    bloomPass.threshold = v;
  });

  // Shadows
  const { csmLight, fireLight } = lights;

  const lightArr: Light[] = [...csmLight.csm.lights];
  if (fireLight) lightArr.push(fireLight.light);

  const shadows = graphics.addFolder("Shadows");
  shadows.close();

  const biasProxy = createShadowBiasProxy(lightArr, shadowMapSizes);

  const highCtrl = shadows
    .add(biasProxy, "high", -0.05, 0.05, 0.0001)
    .name("Shadow Bias");
  const normalCtrl = shadows
    .add(biasProxy, "normal", -0.5, 0.5, 0.0001)
    .name("Normal Bias");

  shadows
    .add(
      graphicsParams,
      "shadowMapSize",
      Object.keys(shadowMapSizes).map(String)
    )
    .name("Shadow Resolution")
    .onChange((v: QualityKeys) => {
      shadowDispose(lightArr);
      applyShadowSizeAndBias(lightArr, v, shadowMapSizes);
      highCtrl.updateDisplay();
      normalCtrl.updateDisplay();
      renderer.shadowMap.needsUpdate = true;
    });

  shadows
    .add(graphicsParams, "shadowEnabled")
    .name("Shadow Enabled")
    .onChange((v: boolean) => {
      renderer.shadowMap.enabled = v;
      shadowDispose(lightArr);

      lightArr.forEach((l) => {
        l.castShadow = v;
      });
      allMatUpdt(scene);
    });
}
