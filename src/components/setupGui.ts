import GUI from "lil-gui";
import { spawnMeshes } from "../utils/_index";
import {
  params,
  bushOptions,
  graveOptions,
  treeOptions,
} from "../../config.json";
import {
  shadowTypes,
  shadowMapSizes,
  makeScene,
} from "./settings/settingsData";
import { shadowDispose } from "../utils/_index";
import { AssetTypes } from "types";
import { UnrealBloomPass } from "three/examples/jsm/Addons";
import {
  WebGLRenderer,
  PointLightHelper,
  DirectionalLightHelper,
  CameraHelper,
  AmbientLight,
  PerspectiveCamera,
  Light,
  Scene,
  PointLight,
  DirectionalLight,
  NoToneMapping,
  LinearToneMapping,
  ReinhardToneMapping,
  CineonToneMapping,
  ACESFilmicToneMapping,
  OrthographicCamera,
} from "three";

interface SetupGUIInterface {
  renderer: WebGLRenderer;
  fireLightHelper: PointLightHelper;
  directionalLightHelper: DirectionalLightHelper;
  directionalLightCameraHelper: CameraHelper;
  ambientLight: AmbientLight;
  camera: PerspectiveCamera;
  cameraHelper: CameraHelper;
  graves: AssetTypes;
  bushes: AssetTypes;
  trees: AssetTypes;
  antialias: boolean;
  onVolumeChange: (v: number) => void;
  bloomPass: UnrealBloomPass;
  lights: Light[];
  scene: Scene;
}
export function setupGUI({
  renderer,
  fireLightHelper,
  directionalLightHelper,
  directionalLightCameraHelper,
  ambientLight,
  camera,
  cameraHelper,
  graves,
  bushes,
  trees,
  antialias,
  onVolumeChange,
  bloomPass,
  lights,
  scene,
}: SetupGUIInterface) {
  const [fireLight, directionalLight] = lights as [
    PointLight,
    DirectionalLight
  ];
  const gui = new GUI({ title: "Settings" }).close();
  gui.hide();
  document.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "h") {
      if (gui._hidden || gui._hidden) {
        gui.show();
      } else {
        gui.hide();
      }
    }
  });
  gui
    .add(params, "volume", 0, 1.5, 0.1)
    .name("Volume")
    .onChange((v: number) => {
      if (onVolumeChange) onVolumeChange(v);
    });

  const antialiasObj = { antialias };

  const graphics = gui.addFolder("Graphics Settings");
  graphics.close();
  graphics
    .add(antialiasObj, "antialias")
    .name("Antialiasing")
    .onFinishChange(() => {
      localStorage.setItem("antialias", String(antialiasObj.antialias));
      location.reload();
    });
  const toneMappings = {
    None: NoToneMapping,
    Linear: LinearToneMapping,
    Reinhard: ReinhardToneMapping,
    Cineon: CineonToneMapping,
    ACESFilmic: ACESFilmicToneMapping,
  };

  //bloom
  const bloomParams = params.bloomParams;
  graphics.add(bloomParams, "enabled").name("Enable Bloom");
  graphics
    .add(bloomParams, "strength", 0, 5)
    .onChange((v: number) => (bloomPass.strength = v));
  graphics
    .add(bloomParams, "radius", 0, 2)
    .onChange((v: number) => (bloomPass.radius = v));
  graphics
    .add(bloomParams, "threshold", 0, 1)
    .onChange((v: number) => (bloomPass.threshold = v));

  graphics
    .add(params, "toneMapping", Object.keys(toneMappings))
    .name("Tone Mapping")
    .onChange((v: string) => {
      renderer.toneMapping = toneMappings[v as keyof typeof toneMappings];
      renderer.toneMappingExposure = params.toneMappingExposure || 1;
    });

  graphics
    .add(params, "toneMappingExposure", 0, 2, 0.01)
    .name("Tone Exposure")
    .onChange((v: number) => {
      renderer.toneMappingExposure = v;
    });

  graphics
    .add(params, "shadowEnabled")
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
  graphics
    .add(params, "shadowType", Object.keys(shadowTypes))
    .name("Shadow Type")
    .onChange((v: string) => {
      shadowDispose(lights);
      renderer.shadowMap.type = shadowTypes[v as keyof typeof shadowTypes];
      renderer.shadowMap.needsUpdate = true;
    });
  graphics
    .add(params, "shadowMapSize", shadowMapSizes)
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
  const ambientLightGui = graphics.addFolder("Ambient Light Settings");
  ambientLightGui.close();
  ambientLightGui
    .add(params, "ambientLightIntensity", 0, 10, 0.1)
    .name("Light Intensity")
    .onChange((v: number) => {
      ambientLight.intensity = v;
    });
  ambientLightGui
    .addColor(params, "ambientLightColor")
    .name("Light Color")
    .onFinishChange(() => {
      ambientLight.color.set(params.ambientLightColor);
    });

  const fireLightGui = graphics.addFolder("Fire Light Settings");
  fireLightGui.close();

  fireLightGui
    .add(params, "fireLightHelper")
    .name("Light Helper")
    .onChange((v: boolean) => {
      if (v) {
        scene.add(fireLightHelper);
      } else {
        scene.remove(fireLightHelper);
      }
    });
  fireLightGui
    .add(params, "fireLightIntensity", 0, 100, 0.1)
    .name("Intensity")
    .onChange((v: number) => {
      fireLight.intensity = v;
    });

  fireLightGui
    .add(params, "fireLightDistance", 0, 200, 0.1)
    .name("Distance")
    .onChange((v: number) => {
      (fireLight as PointLight).distance = v;
    });

  fireLightGui
    .add(params, "fireLightDecay", 0, 10, 0.01)
    .name("Decay")
    .onChange((v: number) => {
      (fireLight as PointLight).decay = v;
    });

  fireLightGui
    .add(params, "shadowBias", -0.01, 0.01, 0.0001)
    .name("Shadow Bias")
    .onChange((v: number) => {
      if (fireLight.shadow) {
        fireLight.shadow.bias = v;
        fireLight.shadow.normalBias = v;
      }
    });

  fireLightGui
    .add(params, "shadowNormalBias", 0, 1, 0.001)
    .name("Normal Bias")
    .onChange((v: number) => {
      if (fireLight.shadow) {
        fireLight.shadow.normalBias = v;
      }
    });

  const directionalLightGui = graphics.addFolder("Directional Light Settings");
  directionalLightGui.close();

  directionalLightGui
    .addColor(params, "directionalLightColor")
    .name("Light Color")
    .onFinishChange(() => {
      directionalLight.color.set(params.directionalLightColor);
    });

  directionalLightGui
    .add(params, "shadowCameraWidth", 2, 45, 0.1)
    .name("Shadow Camera Width")
    .onChange((v: number) => {
      const half = v / 2;
      if (
        directionalLight.shadow &&
        directionalLight.shadow.camera instanceof OrthographicCamera
      ) {
        const cam = directionalLight.shadow.camera;
        cam.left = -half;
        cam.right = half;
        cam.top = half;
        cam.bottom = -half;
        cam.near = v;
        cam.far = v;
        cam.updateProjectionMatrix();
      }
      directionalLightCameraHelper.update();
    });

  directionalLightGui
    .add(params, "shadowCameraHeight", 2, 40, 0.1)
    .name("Shadow Camera Height")
    .onChange((v: number) => {
      const half = v / 2;
      directionalLight.shadow.camera.top = half;
      directionalLight.shadow.camera.bottom = -half;
      directionalLight.shadow.camera.updateProjectionMatrix();
      directionalLightCameraHelper.update();
    });

  directionalLightGui
    .add(params, "shadowCameraNear", 0.01, 5, 0.01)
    .name("Shadow Camera Near")
    .onFinishChange((v: number) => {
      if (v >= directionalLight.shadow.camera.far) {
        params.shadowCameraNear = directionalLight.shadow.camera.far - 0.01;
        directionalLight.shadow.camera.near = params.shadowCameraNear;
      } else {
        directionalLight.shadow.camera.near = v;
      }
      directionalLight.shadow.camera.updateProjectionMatrix();
      directionalLightCameraHelper.update();
    });

  directionalLightGui
    .add(params, "shadowCameraFar", 0.1, 60, 0.01)
    .name("Shadow Camera Far")
    .onFinishChange((v: number) => {
      if (v <= directionalLight.shadow.camera.near) {
        params.shadowCameraFar = directionalLight.shadow.camera.near + 0.01;
        directionalLight.shadow.camera.far = params.shadowCameraFar;
      } else {
        directionalLight.shadow.camera.far = v;
      }
      directionalLight.shadow.camera.updateProjectionMatrix();
      directionalLightCameraHelper.update();
    });

  directionalLightGui
    .add(params, "directionalLightIntensity", 0, 10, 0.1)
    .name("Light Intensity")
    .onChange((v: number) => {
      directionalLight.intensity = v;
    });
  directionalLightGui
    .add(params, "directionalLightX", -60, 60, 0.5)
    .name("Light X")
    .onChange((v: number) => {
      directionalLight.position.x = v;
    });
  directionalLightGui
    .add(params, "directionalLightY", 0, 60, 0.5)
    .name("Light Y")
    .onChange((v: number) => {
      directionalLight.position.y = v;
    });
  directionalLightGui
    .add(params, "directionalLightZ", -60, 60, 0.5)
    .name("Light Z")
    .onChange((v: number) => {
      directionalLight.position.z = v;
    });

  directionalLightGui
    .add(params, "directionalLightHelper")
    .name("Light Helper")
    .onChange((v: boolean) => {
      if (v) {
        scene.add(directionalLightHelper);
        scene.add(directionalLightCameraHelper);
      } else {
        scene.remove(directionalLightHelper);
        scene.remove(directionalLightCameraHelper);
      }
    });
  directionalLightGui
    .add(params, "shadowBias", -0.01, 0.01, 0.0001)
    .name("Shadow Bias")
    .onChange((v: number) => {
      directionalLight.shadow.bias = v;
    });

  directionalLightGui
    .add(params, "shadowNormalBias", 0, 1, 0.001)
    .name("Normal Bias")
    .onChange((v: number) => {
      directionalLight.shadow.normalBias = v;
    });

  const sceneOptions = gui.addFolder("Scene Options");
  sceneOptions.close();
  const map: Record<
    "graveCount" | "bushCount" | "treeCount",
    { manager: AssetTypes; opts: any }
  > = {
    graveCount: {
      manager: graves,
      opts: graveOptions,
    },
    bushCount: {
      manager: bushes,
      opts: bushOptions,
    },
    treeCount: {
      manager: trees,
      opts: treeOptions,
    },
  };
  makeScene().forEach((control) => {
    if (control.type === "range") {
      const { id, label, min, max, step } = control;
      const cfg = map[id as "graveCount" | "bushCount" | "treeCount"];
      if (!cfg) return;

      sceneOptions
        .add(params, id as keyof typeof params, min, max, step)
        .name(label)
        .onChange((val: number) => {
          const { manager, opts } = cfg;
          const meshes = manager.baseMeshes || [];
          const group = manager.group;
          if (meshes.length > 0 && group) {
            spawnMeshes({
              baseMeshes: meshes,
              group: group,
              count: val,
              options: opts,
            });
          }
        });
    }
  });
  //camera settings
  const cameraGui = gui.addFolder("Camera Settings");
  cameraGui.close();

  cameraGui
    .add(params, "cameraFov", 10, 120, 1)
    .name("FOV")
    .onChange((v: number) => {
      camera.fov = v;
      camera.updateProjectionMatrix();
      cameraHelper.update();
    });

  cameraGui
    .add(params, "cameraNear", 0.01, 10, 0.01)
    .name("Near")
    .onChange((v: number) => {
      camera.near = v;
      camera.updateProjectionMatrix();
      cameraHelper.update();
    });

  cameraGui
    .add(params, "cameraFar", 1, 500, 1)
    .name("Far")
    .onChange((v: number) => {
      camera.far = v;
      camera.updateProjectionMatrix();
      cameraHelper.update();
    });

  cameraGui
    .add(params, "cameraX", -50, 50, 0.1)
    .name("Position X")
    .onChange((v: number) => {
      camera.position.x = v;
      cameraHelper.update();
    });

  cameraGui
    .add(params, "cameraY", -50, 50, 0.1)
    .name("Position Y")
    .onChange((v: number) => {
      camera.position.y = v;
      cameraHelper.update();
    });

  cameraGui
    .add(params, "cameraZ", -50, 50, 0.1)
    .name("Position Z")
    .onChange((v: number) => {
      camera.position.z = v;
      cameraHelper.update();
    });

  cameraGui
    .add(params, "cameraHelper")
    .name("Show Helper")
    .onChange((v: boolean) => {
      if (v) {
        scene.add(cameraHelper);
      } else {
        scene.remove(cameraHelper);
      }
    });
  return gui;
}
