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
  scene,
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

  const shadowMapSizes = [256, 512, 1024, 2048, 4096];
  const shadowDistOpt = [
    {
      n: "Half",
      w: 16,
      f: 20,
    },
    {
      n: "3/4",
      w: 30,
      f: 27,
    },
    {
      n: "Full",
      w: 40,
      f: 36,
    },
  ];

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

  const controls = [
    {
      type: "range",
      id: "volume",
      label: "Volume",
      min: 0,
      max: 100,
      step: 1,
      value: initialVolume,
      span: "volumeValue",
    },
    {
      type: "range",
      id: "brightness",
      label: "Brightness",
      min: 0,
      max: 1,
      step: 0.01,
      value: params.toneMappingExposure,
      span: "brightnessValue",
    },
    {
      type: "checkbox",
      id: "antialiasing",
      label: "Antialiasing",
      checked: antialias,
    },
    {
      type: "checkbox",
      id: "bloomEnabled",
      label: "Bloom",
      checked: params.bloomParams.enabled,
    },
    {
      type: "checkbox",
      id: "fogToggle",
      label: "Fog Effect",
      checked: params.fog,
    },
    {
      type: "checkbox",
      id: "shadowEnabled",
      label: "Enable Shadows",
      checked: renderer.shadowMap.enabled,
    },
    {
      type: "select",
      id: "shadowDistance",
      label: "Shadow Distance",
      options: shadowDistOpt.map((o) => ({
        v: o.n.toLowerCase(),
        t: o.n,
        s: params.shadowCameraWidth == o.w && params.shadowCameraFar == o.f,
      })),
    },
    {
      type: "select",
      id: "shadowResolution",
      label: "Shadow Resolution",
      options: shadowMapSizes.map((siz) => ({
        v: siz,
        t: siz,
        s: params.shadowMapSize == siz,
      })),
    },
    {
      type: "select",
      id: "shadowType",
      label: "Shadow Type",
      options: Object.entries(shadowTypes).map(([v, typeConst]) => ({
        v,
        t: v === "PCFSoft" ? "PCF Soft" : v,
        s: renderer.shadowMap.type === typeConst,
      })),
    },
    {
      type: "select",
      id: "quality",
      label: "Texture Quality",
      options: [
        { v: "low", t: "Low", s: false },
        { v: "medium", t: "Medium", s: true },
        { v: "high", t: "High", s: false },
      ],
    },
    {
      type: "select",
      id: "toneMapping",
      label: "Tone Mapping",
      options: [
        {
          v: "NoToneMapping",
          t: "None",
          s: renderer.toneMapping === THREE.NoToneMapping,
        },
        {
          v: "LinearToneMapping",
          t: "Linear",
          s: renderer.toneMapping === THREE.LinearToneMapping,
        },
        {
          v: "ReinhardToneMapping",
          t: "Reinhard",
          s: renderer.toneMapping === THREE.ReinhardToneMapping,
        },
        {
          v: "CineonToneMapping",
          t: "Cineon",
          s: renderer.toneMapping === THREE.CineonToneMapping,
        },
        {
          v: "ACESFilmicToneMapping",
          t: "ACES",
          s: renderer.toneMapping === THREE.ACESFilmicToneMapping,
        },
      ],
    },
  ];

  settingsDiv.innerHTML = controls
    .map((c) =>
      c.type === "range"
        ? `<label>${c.label}:<input type="range" id="${c.id}" 
        min="${c.min}" max="${c.max}" step="${c.step}" 
        value="${c.value}"/><span id="${c.span}">${c.value}
        </span>
        </label><br/>`
        : c.type === "checkbox"
        ? `<label><input type="checkbox" id="${c.id}"${
            c.checked ? " checked" : ""
          }/> ${c.label}</label><br/>`
        : c.type === "select"
        ? `<label>${c.label}:<select id="${c.id}">${c.options
            .map(
              (o) =>
                `<option value="${o.v}"${o.s ? " selected" : ""}>${
                  o.t
                }</option>`
            )
            .join("")}</select></label><br/>`
        : ""
    )
    .join("");

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
  document.getElementById("shadowDistance").addEventListener("input", (e) => {
    const opt = shadowDistOpt.find((o) => o.n.toLowerCase() === e.target.value);
    if (!opt) return;
    params.shadowCameraWidth = opt.w;
    params.shadowCameraFar = opt.f;
    const left = -opt.w / 2;
    const right = opt.w / 2;
    const far = opt.f;

    directionalLight.shadow.camera.left = left;
    directionalLight.shadow.camera.right = right;
    directionalLight.shadow.camera.far = far;
    directionalLight.shadow.camera.updateProjectionMatrix();
    directionalLightCameraHelper.update();
  });

  document
    .getElementById("shadowResolution")
    .addEventListener("change", (e) => {
      const res = Number(e.target.value);
      shadowDispose();
      fireLight.shadow.mapSize.set(res, res);
      directionalLight.shadow.mapSize.set(res, res);
      params.shadowMapSize = res;
      renderer.shadowMap.needsUpdate = true;
    });

  document.getElementById("shadowType").addEventListener("change", (e) => {
    const val = e.target.value;
    shadowDispose();
    renderer.shadowMap.type = shadowTypes[val];
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
    .add(params, "shadowMapSize", shadowMapSizes)
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
    .add(params, "shadowCameraWidth", 2, 45, 0.1)
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
