// SPDX-License-Identifier: GPL-3.0
// Copyright (C) 2025 Tahsin Önemli
// This file is part of Tarnished-house. See the LICENSE file for details.
import "@/patches/lod-patch";

import assets from "assets.json";
import config from "config.json";
import {
  Color,
  LoadingManager,
  type PositionalAudio,
  Scene,
  TextureLoader
} from "three";
import {
  byId,
  createPerfHUD,
  initCreditsModal,
  initIntroModal,
  initScreenshotButton,
  type SetupGUI,
  settings,
  setupToggleButton
} from "./components";
import {
  applyPerfProfile,
  CameraController,
  camCnfg,
  createAudio,
  createBtn,
  createCenterDot,
  createComposer,
  createLights,
  createRenderer,
  Loop
} from "./engine";
import { loadAssets, type ManagerRefs, randomMeshes } from "./loaders";
import { Bonfire } from "./prefabs";
import type { AudioBundle } from "./types/global.types";
import { createSizes, setMatsCMS } from "./utils";

const IS_E2E =
  import.meta.env.VITE_E2E === "1" ||
  new URL(location.href).searchParams.has("e2e");

export const IS_DEV: boolean = import.meta.env.DEV;

const DEV_PROFILE = config.devProfile;
if (IS_DEV) {
  camCnfg.far = 500;
  camCnfg.fov = 75;
  config.scene.postProcessing.fog.enabled = false;
  config.scene.renderer.toneMappingExposure = 1.75;
}

//
// Mobile Detection & Performance Optimization
//
await applyPerfProfile();

const showEnterButton = initIntroModal();

if (IS_DEV && DEV_PROFILE.skipIntro) {
  showEnterButton();
  requestAnimationFrame(() => {
    const btn = byId<HTMLButtonElement>("enter-scene");
    btn.click();
  });
}

//
// Canvas
//

const canvas = document.querySelector("canvas.webgl") as HTMLCanvasElement;
const sizes = createSizes();

const scene = new Scene();
scene.background = new Color(config.scene.postProcessing.fog.color);

const loadingManager = new LoadingManager();
const texLoader = new TextureLoader(loadingManager);

//
// Camera & Orbit Control
//

const CamController = CameraController({
  scene,
  canvas,
  sizes
});

//
// renderer
//

const antialias = localStorage.getItem("antialias") === "true";

export const renderer = createRenderer({ sizes, canvas, antialias });

if (IS_E2E) {
  window.__RENDERER__ = renderer;
  window.__SCENE__ = scene;
}

//Postprocessing

const { composer, bloomPass, syncBloom } = createComposer({
  renderer,
  scene,
  camera: CamController.camera
});

//
// ASSET LOADING
// Load static models and textures
//
loadAssets({
  scene,
  loadingManager,
  renderer,
  texLoader
});

//
//Size Update
//
window.addEventListener("resize", () => {
  sizes.update();

  CamController.camera.aspect = sizes.width / sizes.height;
  CamController.camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(sizes.pixelRatio);

  composer.setSize(sizes.width, sizes.height);
  bloomPass.setSize(sizes.width, sizes.height);

  smoke.updtScreen(sizes.pixelRatio);
  sparks.updtScreen(sizes.pixelRatio);
});

//
// Sounds
//
const { setVol, resume, createAmbience, createPositional } = createAudio({
  camera: CamController.camera,
  loadingManager
});
const ambianceS = createAmbience(config.sounds.ambiance);

const { muteBtn, updtMuteIcon } = setupToggleButton(); // Audio mute button and icon

let audioUnlocked = false;
let muted = true;
const targetVolume = config.scene.audio.volume;

function setMuted(val: boolean) {
  muted = val;
  const v = muted ? 0 : targetVolume;
  setVol(v);
  updtMuteIcon(v);
}

async function startAudio() {
  if (!audioUnlocked) {
    await resume();
    effect.play();
    ambianceS.play();
    audioUnlocked = true;
  }
  setMuted(false);
}

muteBtn.addEventListener("click", () => setMuted(!muted), { passive: true });

const audio: AudioBundle = {
  setVol,
  updtMuteIcon
};

if (!IS_DEV) {
  loadingManager.onLoad = () => {
    showEnterButton(startAudio);
    initCreditsModal();
  };
} else {
  initCreditsModal();
}

//
// Lights
//

const lights = createLights(scene, CamController);

const ray = createCenterDot(canvas);
//
// Ignite Button
let ignited = false;
const {
  button: igniteBtn,
  setLabel,
  update
} = await createBtn({
  btnOpts: {
    width: 0.65,
    height: 0.23,
    label: "Ignite",
    rotation: { x: -Math.PI / 2, y: 0, z: 0 },
    onClick: () => {
      ignited ? bonfire.extinguish() : bonfire.ignite();
      ignited = !ignited;
      setLabel(ignited ? "Extinguish" : "Ignite");
    }
  },
  ray: ray.rayCast,
  camera: CamController.camera,
  canvas
});

//
// Bonfire
//
const bonfire = await Bonfire.create(sizes, assets.models.bonfire["inst-1"]);

const audioOpts = assets.models.bonfire.audio;
createPositional(audioOpts).then((s) => bonfire.attachAudio(s));

let effect: PositionalAudio;
createPositional({
  url: audioOpts.firestartUrl,
  opts: { ...audioOpts.opts, loop: false, autoplay: false, volume: 1 }
}).then((s) => {
  bonfire.attachSfx(s);
  effect = s;
});

scene.add(bonfire);

igniteBtn.position.copy(bonfire.position);
igniteBtn.position.z += 2.0;

scene.add(igniteBtn);

lights.fireLight = bonfire.fireLight;
const { smoke, sparks, flame } = bonfire;
function getManagers(): ManagerRefs {
  if (!managers) throw new Error("managers not ready");
  return managers;
}

setMatsCMS(lights.directLight, scene);

//
// Stats
const hud = createPerfHUD({ renderer, container: document.body });
if (IS_DEV && DEV_PROFILE.autoStats) {
  try {
    hud.toggleStats(true);
  } catch {}
}
type SceneUpdate = (dt: number, elapsed: number) => void;

const activeUpdate: SceneUpdate = (dt, elapsed) => {
  bonfire.step(dt, elapsed);
};

let runSceneUpdate: SceneUpdate = activeUpdate;

let guiLoaded = false;
let devGUI: SetupGUI | undefined;

async function openDevGUI() {
  if (guiLoaded) return;
  if (!managers) {
    console.warn("DevGUI requested before managers are ready");
    return;
  }
  guiLoaded = true;

  const { initSetupGUI } = await import("./components");

  const mgrs = getManagers();

  devGUI = initSetupGUI({
    devMode: IS_DEV,
    renderer,
    CamController,
    randomMeshes: mgrs,
    antialias,
    audio,
    bloomPass,
    scene,
    lights,
    particleSystems: { flame, smoke, sparks },
    syncBloom
  });

  const r = devGUI.runtime;

  const origToggle = r.togglePause;
  r.togglePause = () => {
    origToggle();
    const paused = r.isPaused();
    runSceneUpdate = paused ? (_dt, _elapsed) => {} : activeUpdate;
    renderer.shadowMap.autoUpdate = !paused;
  };
}

//
// Randomized mesh placement system (e.g. graves, trees, etc.)
let managers: ManagerRefs | undefined;

randomMeshes({ scene }).then((m) => {
  managers = m;
  setMatsCMS(lights.directLight, scene);

  if (IS_DEV && DEV_PROFILE.autoOpenGUI) openDevGUI();

  window.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "h" && !guiLoaded) openDevGUI();
  });

  //
  // Settings
  //
  settings({
    lights,
    renderer,
    randomMeshes: getManagers(),
    antialias,
    audio,
    scene,
    toggleStats: hud.toggleStats,
    CamController,
    syncBloom
  });

  initScreenshotButton({ renderer, composer });
});

//---------------------------------------------------
//
//
// Main loop
// Updates animations & renders frames
//

const loop = new Loop();

const controlUpdt: (d: number) => void = IS_DEV
  ? (d) => CamController.controller?.(d)
  : (d) => {
      CamController.controller?.(d);
      CamController.clampCameraPosition();
    };

loop.addUpdate((delta, elapsed) => {
  CamController.controls.update();
  controlUpdt(delta);

  CamController.camera.updateMatrix();
  update();
  lights.directLight.update();

  runSceneUpdate(delta, elapsed);
});

loop.addRender(() => {
  composer.render();
  hud.updateOverlay();
});

loop.start();
