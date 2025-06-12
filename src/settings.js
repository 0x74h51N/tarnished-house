import GUI from "lil-gui";
import * as THREE from "three";

export function setupGUI({
  params,
  renderer,
  fireLight,
  fireLightHelper,
  directionalLight,
  directionalLightHelper,
  directionalLightCameraHelper,
  ambientLight,
  camera,
  cameraHelper,
  spawnMeshes,
  graveBaseMeshes,
  graveGroup,
  graveGLTF,
  graveOptions,
  bushBaseMeshes,
  bushGroup,
  bushGLTF,
  bushOptions,
  treeBaseMeshes,
  treesGroup,
  treeGLTF,
  treeOptions,
  antialias,
  onVolumeChange,
}) {
  const gui = new GUI({ title: "Settings" }).close();

  gui
    .add(params, "volume", 0, 1.5, 0.1)
    .name("Volume")
    .onChange((v) => {
      if (onVolumeChange) onVolumeChange(v);
    });

  const antialiasObj = { antialias };

  const graphics = gui.addFolder("Graphics Settings");
  graphics.close();
  graphics
    .add(antialiasObj, "antialias")
    .name("Antialiasing")
    .onFinishChange(() => {
      localStorage.setItem("antialias", antialiasObj.antialias);
      location.reload();
    });
  const toneMappings = {
    None: THREE.NoToneMapping,
    Linear: THREE.LinearToneMapping,
    Reinhard: THREE.ReinhardToneMapping,
    Cineon: THREE.CineonToneMapping,
    ACESFilmic: THREE.ACESFilmicToneMapping,
  };

  graphics
    .add(params, "toneMapping", Object.keys(toneMappings))
    .name("Tone Mapping")
    .onChange((v) => {
      renderer.toneMapping = toneMappings[v];
      renderer.toneMappingExposure = params.toneMappingExposure || 1;
    });

  graphics
    .add(params, "toneMappingExposure", 0, 2, 0.01)
    .name("Tone Exposure")
    .onChange((v) => {
      renderer.toneMappingExposure = v;
    });

  const shadowTypes = {
    Basic: THREE.BasicShadowMap,
    PCF: THREE.PCFShadowMap,
    PCFSoft: THREE.PCFSoftShadowMap,
    VSM: THREE.VSMShadowMap,
  };

  const shadowDispose = () => {
    if (fireLight.shadow.map) {
      fireLight.shadow.map.dispose();
      fireLight.shadow.map = null;
    }
    if (directionalLight.shadow.map) {
      directionalLight.shadow.map.dispose();
      directionalLight.shadow.map = null;
    }
  };
  graphics
    .add(params, "shadowEnabled")
    .name("Shadow Enabled")
    .onChange((v) => {
      renderer.shadowMap.enabled = v;
      shadowDispose();
      directionalLight.castShadow = v;
      directionalLight.shadow.camera.visible = v;
      renderer.shadowMap.enabled = v;
      renderer.shadowMap.needsUpdate = true;
    });
  graphics
    .add(params, "shadowType", Object.keys(shadowTypes))
    .name("Shadow Type")
    .onChange((v) => {
      shadowDispose();
      renderer.shadowMap.type = shadowTypes[v];
      renderer.shadowMap.needsUpdate = true;
    });
  graphics
    .add(params, "shadowMapSize", [256, 512, 1024, 2048, 4096, 8192])
    .name("Shadow Resolution")
    .onChange((v) => {
      shadowDispose();
      fireLight.shadow.mapSize.set(Number(v), Number(v));
      directionalLight.shadow.mapSize.set(Number(v), Number(v));
      renderer.shadowMap.needsUpdate = true;
    });
  const ambientLightGui = graphics.addFolder("Ambient Light Settings");
  ambientLightGui.close();
  ambientLightGui
    .add(params, "ambientLightIntensity", 0, 10, 0.1)
    .name("Light Intensity")
    .onChange((v) => {
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
    .onChange((v) => {
      if (v) {
        scene.add(fireLightHelper);
      } else {
        scene.remove(fireLightHelper);
      }
    });
  fireLightGui
    .add(params, "fireLightIntensity", 0, 100, 0.1)
    .name("Intensity")
    .onChange((v) => {
      fireLight.intensity = v;
    });

  fireLightGui
    .add(params, "fireLightDistance", 0, 200, 0.1)
    .name("Distance")
    .onChange((v) => {
      fireLight.distance = v;
    });

  fireLightGui
    .add(params, "fireLightDecay", 0, 10, 0.01)
    .name("Decay")
    .onChange((v) => {
      fireLight.decay = v;
    });

  fireLightGui
    .add(params, "shadowBias", -0.01, 0.01, 0.0001)
    .name("Shadow Bias")
    .onChange((v) => {
      fireLight.shadow.bias = v;
    });

  fireLightGui
    .add(params, "shadowNormalBias", 0, 1, 0.001)
    .name("Normal Bias")
    .onChange((v) => {
      fireLight.shadow.normalBias = v;
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
    .add(params, "shadowCameraWidth", 2, 40, 0.1)
    .name("Shadow Camera Width")
    .onChange((v) => {
      const half = v / 2;
      directionalLight.shadow.camera.left = -half;
      directionalLight.shadow.camera.right = half;
      directionalLight.shadow.camera.updateProjectionMatrix();
      directionalLightCameraHelper.update();
    });

  directionalLightGui
    .add(params, "shadowCameraHeight", 2, 40, 0.1)
    .name("Shadow Camera Height")
    .onChange((v) => {
      const half = v / 2;
      directionalLight.shadow.camera.top = half;
      directionalLight.shadow.camera.bottom = -half;
      directionalLight.shadow.camera.updateProjectionMatrix();
      directionalLightCameraHelper.update();
    });

  directionalLightGui
    .add(params, "shadowCameraNear", 0.01, 5, 0.01)
    .name("Shadow Camera Near")
    .onFinishChange((v) => {
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
    .onFinishChange((v) => {
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
    .onChange((v) => {
      directionalLight.intensity = v;
    });
  directionalLightGui
    .add(params, "directionalLightX", -60, 60, 0.5)
    .name("Light X")
    .onChange((v) => {
      directionalLight.position.x = v;
    });
  directionalLightGui
    .add(params, "directionalLightY", 0, 60, 0.5)
    .name("Light Y")
    .onChange((v) => {
      directionalLight.position.y = v;
    });
  directionalLightGui
    .add(params, "directionalLightZ", -60, 60, 0.5)
    .name("Light Z")
    .onChange((v) => {
      directionalLight.position.z = v;
    });

  directionalLightGui
    .add(params, "directionalLightHelper")
    .name("Light Helper")
    .onChange((v) => {
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
    .onChange((v) => {
      directionalLight.shadow.bias = v;
    });

  directionalLightGui
    .add(params, "shadowNormalBias", 0, 1, 0.001)
    .name("Normal Bias")
    .onChange((v) => {
      directionalLight.shadow.normalBias = v;
    });

  const sceneOptions = gui.addFolder("Scene Options");
  sceneOptions.close();

  sceneOptions
    .add(params, "graveCount", 1, 100, 1)
    .name("Grave Count")
    .onChange(() => {
      graveBaseMeshes.length > 0 &&
        graveGLTF &&
        spawnMeshes(
          graveBaseMeshes,
          graveGroup,
          params.graveCount,
          graveOptions
        );
    });
  sceneOptions
    .add(params, "bushCount", 1, 100, 1)
    .name("Bush Count")
    .onChange(() => {
      bushBaseMeshes.length > 0 &&
        bushGLTF &&
        spawnMeshes(bushBaseMeshes, bushGroup, params.bushCount, bushOptions);
    });
  sceneOptions
    .add(params, "treeCount", 1, 100, 1)
    .name("Tree Count")
    .onChange(() => {
      treeBaseMeshes.length > 0 &&
        treeGLTF &&
        spawnMeshes(treeBaseMeshes, treesGroup, params.treeCount, treeOptions);
    });

  //camera settings
  const cameraGui = gui.addFolder("Camera Settings");
  cameraGui.close();

  cameraGui
    .add(params, "cameraFov", 10, 120, 1)
    .name("FOV")
    .onChange((v) => {
      camera.fov = v;
      camera.updateProjectionMatrix();
      cameraHelper.update();
    });

  cameraGui
    .add(params, "cameraNear", 0.01, 10, 0.01)
    .name("Near")
    .onChange((v) => {
      camera.near = v;
      camera.updateProjectionMatrix();
      cameraHelper.update();
    });

  cameraGui
    .add(params, "cameraFar", 1, 500, 1)
    .name("Far")
    .onChange((v) => {
      camera.far = v;
      camera.updateProjectionMatrix();
      cameraHelper.update();
    });

  cameraGui
    .add(params, "cameraX", -50, 50, 0.1)
    .name("Position X")
    .onChange((v) => {
      camera.position.x = v;
      cameraHelper.update();
    });

  cameraGui
    .add(params, "cameraY", -50, 50, 0.1)
    .name("Position Y")
    .onChange((v) => {
      camera.position.y = v;
      cameraHelper.update();
    });

  cameraGui
    .add(params, "cameraZ", -50, 50, 0.1)
    .name("Position Z")
    .onChange((v) => {
      camera.position.z = v;
      cameraHelper.update();
    });

  cameraGui
    .add(params, "cameraHelper")
    .name("Show Helper")
    .onChange((v) => {
      if (v) {
        scene.add(cameraHelper);
      } else {
        scene.remove(cameraHelper);
      }
    });
  return gui;
}
