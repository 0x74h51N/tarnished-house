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
  skyUniforms,
  bloomPass,
  fogOnChange,
}) {
  //
  //#region settingsDiv
  //

  const settingsDiv = document.getElementById("settings");

  const settingsBtn = document.getElementById("settings-btn");
  const settingsModal = document.getElementById("settings-modal");
  const closeSettings = document.getElementById("close-settings");

  settingsBtn.addEventListener("click", () => {
    settingsModal.classList.add("active");
    settingsModal.classList.remove("hidden");
  });

  closeSettings.addEventListener("click", () => {
    settingsModal.classList.remove("active");
    setTimeout(() => settingsModal.classList.add("hidden"), 400);
  });

  settingsModal.addEventListener("click", (e) => {
    if (e.target === settingsModal) {
      settingsModal.classList.remove("active");
      setTimeout(() => settingsModal.classList.add("hidden"), 400);
    }
  });
  const initialVolume =
    typeof params.volume === "number" ? params.volume * 100 : 1;

  const initialWidth =
    (directionalLight.shadow.camera.right -
      directionalLight.shadow.camera.left) *
    2;
  const initialHeight =
    (directionalLight.shadow.camera.top -
      directionalLight.shadow.camera.bottom) *
    2;
  const initialFar = directionalLight.shadow.camera.far * 2;

  settingsDiv.innerHTML = `
  <label>
    Volume:
    <input type="range" id="volume" min="0" max="100" step="1" value="${initialVolume}" />
    <span id="volumeValue">${initialVolume}</span>
  </label><br/>
    <h3>Graphics Settings</h3>
    <label>
      <input type="checkbox" id="antialiasing" ${antialias ? "checked" : ""}/>
      Antialiasing
    </label><br/>
    <label>
      <input type="checkbox" id="bloomEnabled" ${
        params.bloomParams.enabled ? "checked" : ""
      }/>
      Bloom
    </label><br/>
    <label>
  <input type="checkbox" id="fogToggle" ${params.fog ? "checked" : ""}/>
  Fog Effect
</label><br/>

    <label>
      <input type="checkbox" id="shadowEnabled" ${
        renderer.shadowMap.enabled ? "checked" : ""
      }/>
      Enable Shadows
    </label><br/>
    <label>
    Shadow Map Width:
    <input type="range" id="shadowDistanceWidth" min="10" max="100" value="${initialWidth}" />
    <span id="shadowDistanceWidthValue">${initialWidth}</span>
   </label><br/>
    <label>
    Shadow Map Height:
    <input type="range" id="shadowDistanceHeight" min="10" max="100" value="${initialHeight}" />
    <span id="shadowDistanceHeightValue">${initialHeight}</span>
    </label><br/>
      <label>
    Shadow Map Distance:
    <input type="range" id="shadowMapDistance" min="1" max="100" value="${initialFar}" />
    <span id="shadowMapDistanceValue">${initialFar}</span>
  </label><br/>
      <label>
      Shadow Resolution:
      <select id="shadowResolution">
       <option value="256" ${
         params.shadowMapSize == 256 ? "selected" : ""
       }>256</option>
        <option value="512" ${
          params.shadowMapSize == 512 ? "selected" : ""
        }>512</option>
        <option value="1024" ${
          params.shadowMapSize == 1024 ? "selected" : ""
        }>1024</option>
        <option value="2048" ${
          params.shadowMapSize == 2048 ? "selected" : ""
        }>2048</option>
        <option value="4096" ${
          params.shadowMapSize == 4096 ? "selected" : ""
        }>4096</option>
      </select>
    </label><br/>
    <label>
      Shadow Type:
      <select id="shadowType">
        <option value="BasicShadowMap" ${
          renderer.shadowMap.type === THREE.BasicShadowMap ? "selected" : ""
        }>Basic</option>
        <option value="PCFShadowMap" ${
          renderer.shadowMap.type === THREE.PCFShadowMap ? "selected" : ""
        }>PCF</option>
        <option value="PCFSoftShadowMap" ${
          renderer.shadowMap.type === THREE.PCFSoftShadowMap ? "selected" : ""
        }>PCF Soft</option>
      </select>
    </label><br/>
    <label>
      Texture Quality:
      <select id="quality">
        <option value="low">Low</option>
        <option value="medium" selected>Medium</option>
        <option value="high">High (Detailed Texture)</option>
      </select>
    </label><br/>
    <label>
      Brightness:
      <input type="range" id="brightness" min="0" max="1" step="0.01" value="${
        params.toneMappingExposure
      }" />
      <span id="brightnessValue">${params.toneMappingExposure}</span>
    </label><br/>
    <label>
      Tone Mapping:
      <select id="toneMapping">
        <option value="NoToneMapping" ${
          renderer.toneMapping === THREE.NoToneMapping ? "selected" : ""
        }>None</option>
        <option value="LinearToneMapping" ${
          renderer.toneMapping === THREE.LinearToneMapping ? "selected" : ""
        }>Linear</option>
        <option value="ReinhardToneMapping" ${
          renderer.toneMapping === THREE.ReinhardToneMapping ? "selected" : ""
        }>Reinhard</option>
        <option value="CineonToneMapping" ${
          renderer.toneMapping === THREE.CineonToneMapping ? "selected" : ""
        }>Cineon</option>
        <option value="ACESFilmicToneMapping" ${
          renderer.toneMapping === THREE.ACESFilmicToneMapping ? "selected" : ""
        }>ACES</option>
      </select>
    </label>
  `;

  document.getElementById("antialiasing").addEventListener("change", (e) => {
    localStorage.setItem("antialias", e.target.checked);
    window.location.reload();
  });

  document
    .getElementById("bloomEnabled")
    .addEventListener("change", function (e) {
      params.bloomParams.enabled = e.target.checked;
    });

  const fogToggle = document.getElementById("fogToggle");
  fogToggle.addEventListener("change", fogOnChange);

  document.getElementById("shadowEnabled").addEventListener("change", (e) => {
    const v = e.target.checked;
    shadowDispose();
    directionalLight.castShadow = v;
    directionalLight.shadow.camera.visible = v;
    renderer.shadowMap.enabled = v;
    renderer.shadowMap.needsUpdate = true;
  });

  const volumeInput = document.getElementById("volume");
  const volumeValue = document.getElementById("volumeValue");
  volumeInput.addEventListener("input", (e) => {
    const vol = Number(e.target.value);
    volumeValue.textContent = vol;
    params.volume = vol / 100;
    if (typeof onVolumeChange === "function") onVolumeChange(vol / 100);
  });

  const shadowDistanceWidth = document.getElementById("shadowDistanceWidth");
  const shadowDistanceWidthValue = document.getElementById(
    "shadowDistanceWidthValue"
  );
  shadowDistanceWidth.addEventListener("input", (e) => {
    const width = Number(e.target.value);
    shadowDistanceWidthValue.textContent = width;
    directionalLight.shadow.camera.left = -width / 4;
    directionalLight.shadow.camera.right = width / 4;
    params.shadowCameraWidth = width;
    directionalLight.shadow.camera.updateProjectionMatrix();
  });

  const shadowDistanceHeight = document.getElementById("shadowDistanceHeight");
  const shadowDistanceHeightValue = document.getElementById(
    "shadowDistanceHeightValue"
  );
  shadowDistanceHeight.addEventListener("input", (e) => {
    const height = Number(e.target.value);
    shadowDistanceHeightValue.textContent = height;
    directionalLight.shadow.camera.top = height / 4;
    directionalLight.shadow.camera.bottom = -height / 4;
    params.shadowCameraHeight = height / 2;
    params.shadowCameraFar = height / 2;
    directionalLight.shadow.camera.updateProjectionMatrix();
  });

  const shadowMapDistance = document.getElementById("shadowMapDistance");
  const shadowMapDistanceValue = document.getElementById(
    "shadowMapDistanceValue"
  );
  shadowMapDistance.addEventListener("input", (e) => {
    const far = Number(e.target.value);
    shadowMapDistanceValue.textContent = far;
    directionalLight.shadow.camera.far = far / 2;
    params.shadowCameraFar = far / 2;
    directionalLight.shadow.camera.updateProjectionMatrix();
  });

  document
    .getElementById("shadowResolution")
    .addEventListener("change", (e) => {
      const res = Number(e.target.value);
      if (directionalLight.shadow.map) {
        directionalLight.shadow.map.dispose();
        directionalLight.shadow.map = null;
      }
      if (fireLight.shadow.map) {
        fireLight.shadow.map.dispose();
        fireLight.shadow.map = null;
      }
      fireLight.shadow.mapSize.set(res, res);
      directionalLight.shadow.mapSize.set(res, res);
      params.shadowMapSize = res;
      renderer.shadowMap.needsUpdate = true;
    });

  document.getElementById("shadowType").addEventListener("change", (e) => {
    const val = e.target.value;
    renderer.shadowMap.type = THREE[val];
  });

  document.getElementById("quality").addEventListener("change", (e) => {
    let bias, normalBias;
    if (e.target.value === "high") {
      bias = -0.0005;
      normalBias = 0.005;
    } else if (e.target.value === "medium") {
      bias = -0.001;
      normalBias = 0.01;
    } else {
      bias = -0.002;
      normalBias = 0.02;
    }
    directionalLight.shadow.bias = bias;
    directionalLight.shadow.normalBias = normalBias;
    fireLight.shadow.bias = bias;
    fireLight.shadow.normalBias = normalBias;
    params.shadowBias = bias;
    params.shadowNormalBias = normalBias;
  });

  const brightness = document.getElementById("brightness");
  const brightnessValue = document.getElementById("brightnessValue");
  brightness.addEventListener("input", (e) => {
    const val = Number(e.target.value);
    brightnessValue.textContent = val;
    renderer.toneMappingExposure = val;
    params.toneMappingExposure = val;
  });

  document.getElementById("toneMapping").addEventListener("change", (e) => {
    renderer.toneMapping = THREE[e.target.value];
  });

  //
  //#endregion
  //

  const gui = new GUI({ title: "Settings" }).close();
  gui.hide();
  document.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "h") {
      if (gui._hidden || gui.hidden) {
        gui.show();
      } else {
        gui.hide();
      }
    }
  });
  gui
    .add(params, "volume", 0, 1.5, 0.1)
    .name("Volume")
    .onChange((v) => {
      if (onVolumeChange) onVolumeChange(v);
    });

  const antialiasObj = { antialias };

  if (skyUniforms) {
    const skyFolder = gui.addFolder("Sky");

    skyFolder
      .add(skyUniforms["turbidity"], "value", 0, 50, 0.01)
      .name("Turbidity");
    skyFolder
      .add(skyUniforms["rayleigh"], "value", 0, 10, 0.01)
      .name("Rayleigh");
    skyFolder
      .add(skyUniforms["mieCoefficient"], "value", 0, 0.2, 0.001)
      .name("Mie Coefficient");
    skyFolder
      .add(skyUniforms["mieDirectionalG"], "value", 0, 1, 0.01)
      .name("Mie DirectionalG");

    const sunPos = skyUniforms["sunPosition"].value;
    skyFolder.add(sunPos, "x", -100, 10, 0.01).name("Sun X");
    skyFolder.add(sunPos, "y", -100, 10, 0.01).name("Sun Y");
    skyFolder.add(sunPos, "z", -100, 10, 0.01).name("Sun Z");

    skyFolder.open();
  }

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

  //bloom
  const bloomParams = params.bloomParams;
  graphics.add(bloomParams, "enabled").name("Enable Bloom");
  graphics
    .add(bloomParams, "strength", 0, 5)
    .onChange((v) => (bloomPass.strength = v));
  graphics
    .add(bloomParams, "radius", 0, 2)
    .onChange((v) => (bloomPass.radius = v));
  graphics
    .add(bloomParams, "threshold", 0, 1)
    .onChange((v) => (bloomPass.threshold = v));

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
    .add(params, "shadowMapSize", [256, 512, 1024, 2048, 4096])
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
