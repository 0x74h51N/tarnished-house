// SPDX-License-Identifier: GPL-3.0
// Copyright (C) 2025 Tahsin Önemli
// This file is part of Tarnished-house. See the LICENSE file for details.
import "@/patches/lod-patch";

import config from "config.json";
import assets from "assets.json";
import {
  settings,
  initIntroModal,
  setupToggleButton,
  initCreditsModal,
  initScreenshotButton,
  createPerfHUD,
  SetupGUI,
} from "./components";
import {
  Scene,
  LoadingManager,
  TextureLoader,
  Color,
  PositionalAudio,
} from "three";
import { loadAssets, ManagerRefs, randomMeshes } from "./loaders";
import {
  CameraController,
  createComposer,
  createLights,
  createRenderer,
  applyLowEnd,
  Loop,
  createAudio,
  createBtn,
} from "./engine";
import { AudioBundle } from "./types/global.types";
import { createSizes } from "./utils";
import { Bonfire } from "./prefabs";

export const IS_DEV: boolean = import.meta.env.DEV;
const DEV_PROFILE = config.devProfile;
if (IS_DEV) {
  config.scene.camera.far = 500;
  config.scene.camera.fov = 75;
  config.scene.postProcessing.fog.enabled = false;
  config.scene.renderer.toneMappingExposure = 1.75;
}

//
// Mobile Detection & Performance Optimization
//
await applyLowEnd();

const showEnterButton = initIntroModal();

if (IS_DEV && DEV_PROFILE.skipIntro) {
  showEnterButton();
  requestAnimationFrame(() => {
    const btn = document.getElementById(
      "enter-scene"
    ) as HTMLButtonElement | null;
    if (btn) {
      btn.click();
    }
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
  sizes,
});

//
// renderer
//

const antialias = localStorage.getItem("antialias") === "true";

export const renderer = createRenderer({ sizes, canvas, antialias });

//Postprocessing

const { composer, bloomPass, syncBloom } = createComposer({
  renderer,
  scene,
  camera: CamController.camera,
});

//
// ASSET LOADING
// Load static models and textures
//
loadAssets({
  scene,
  loadingManager,
  renderer,
  texLoader,
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

  smoke.updtScreen!(sizes.pixelRatio);
  sparks.updtScreen!(sizes.pixelRatio);
});

//
// Sounds
//
const { setVol, resume, createAmbience, createPositional } = createAudio({
  camera: CamController.camera,
  loadingManager,
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
  updtMuteIcon,
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

const lights = createLights(scene);

//
// Ignite Button
let ignited = false;
const { button: igniteBtn, setLabel } = await createBtn({
  camera: CamController.camera,
  canvas,
  width: 0.65,
  height: 0.23,
  label: "Ignite",
  rotation: { x: -Math.PI / 2, y: 0, z: 0 },
  onClick: () => {
    ignited ? bonfire.extinguish() : bonfire.ignite();
    ignited = !ignited;
    setLabel(ignited ? "Extinguish" : "Ignite");
  },
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
  opts: { ...audioOpts.opts, loop: false, autoplay: false, volume: 1 },
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
  bonfire!.step(dt, elapsed);
};

let runSceneUpdate: SceneUpdate = activeUpdate;
let getTimeScale: () => number = () => 1;

let guiLoaded = false;
let devGUI: SetupGUI | undefined;
async function openDevGUI() {
  if (guiLoaded) return;
  guiLoaded = true;
  const { initSetupGUI } = await import("./components");

  devGUI = initSetupGUI({
    devMode: IS_DEV,
    renderer,
    CamController,
    randomMeshes: managers!,
    antialias,
    audio,
    bloomPass,
    scene,
    lights,
    particleSystems: { flame, smoke, sparks },
    syncBloom,
  });
  const r = devGUI.runtime;
  getTimeScale = () => devGUI!.runtime.timeScale;

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

  if (IS_DEV && DEV_PROFILE.autoOpenGUI) openDevGUI();

  window.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "h" && !guiLoaded) openDevGUI();
  });

  //
  //Settingis
  //
  settings({
    lights,
    renderer,
    randomMeshes: managers!,
    antialias,
    audio,
    scene,
    toggleStats: hud.toggleStats,
    CamController,
    syncBloom,
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
  ? (d) => CamController.devUpdate?.(d)
  : (d) => {
      CamController.devUpdate?.(d);
      CamController.clampCameraPosition();
    };

loop.addUpdate((delta, elapsed) => {
  CamController.controls.update();
  controlUpdt(delta);
  CamController.camera.updateMatrix();

  const dtScaled = delta * getTimeScale();
  runSceneUpdate(dtScaled, elapsed);
});

loop.addRender(() => {
  composer.render();
  hud.updateOverlay();
});

loop.start();

const IS_E2E = import.meta.env.VITE_E2E === "1";

if (IS_E2E) {
  window.__SCENE__ = scene;
  window.__RENDERER__ = renderer;
}
