import Stats from "stats.js";
import config from "config.json";
import {
  settings,
  initIntroModal,
  hideLoadingScreen,
  showIntroModal,
  initCreditsModal,
  setupToggleButton,
} from "./components";
import { Scene, LoadingManager, TextureLoader, Color } from "three";

import { loadAssets, randomMeshes } from "./loaders";
import {
  CameraController,
  createComposer,
  createLights,
  createRenderer,
  createSound,
  detectLowEnd,
  Loop,
  particleSystem,
} from "./engine";
import { AudioBundle } from "./types";

//
// Mobile Detection & Performance Optimization
//

detectLowEnd();

//
// Canvas
//

const canvas = document.querySelector("canvas.webgl") as HTMLCanvasElement;
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

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
// Lights
//

const lights = createLights(scene);

//
// renderer
//

const antialias = localStorage.getItem("antialias") === "true";

const renderer = createRenderer({ sizes, canvas, antialias });

//Postprocessing

const { composer, bloomPass } = createComposer({
  renderer,
  scene,
  camera: CamController.camera,
});

//
//Size Update
//
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  CamController.camera.aspect = sizes.width / sizes.height;
  CamController.camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  composer.setSize(sizes.width, sizes.height);
  bloomPass.setSize(sizes.width, sizes.height);

  flame.updtScreen();
  smoke.updtScreen();
  sparks.updtScreen();
});
//
// Sounds
//
const { onVolumeChange, positionalSound } = createSound({
  camera: CamController.camera,
  loadingManager,
});

const { btn, updateIcon } = setupToggleButton();
let isMuted = true;

btn.addEventListener("click", () => {
  isMuted = !isMuted;
  const volume = isMuted ? 0 : config.scene.audio.volume;
  onVolumeChange(volume);
  updateIcon(volume);
});

const audio: AudioBundle = {
  setVolume: onVolumeChange,
  updateIcon: updateIcon,
};

//
// ASSET LOADING
// Load static models and textures
//
loadAssets({
  scene,
  loadingManager,
  renderer,
  positionalSound,
  texLoader,
});

//
// Randomized mesh placement system (e.g. graves, trees, etc.)
const managers = randomMeshes({ scene, loadingManager });

//

//
// PARTICLE SYSTEM
// Initialize flame, smoke, and spark emitters
//
const { flame, smoke, sparks } = particleSystem({
  scene,
  texLoader,
  camera: CamController.camera,
});

//
//-----------------Dom Manupulations-----------------
//
//
//SetupGui
//
loadingManager.onLoad = () => {
  hideLoadingScreen();
  showIntroModal();
};
initCreditsModal();
initIntroModal();

const stats = new Stats();
stats.showPanel(1);
stats.showPanel(0);
let guiLoaded = false;

window.addEventListener("keydown", async (e) => {
  if (e.key.toLowerCase() === "h" && !guiLoaded) {
    guiLoaded = true;
    const { initSetupGUI } = await import("./components");
    initSetupGUI({
      renderer,
      CamController,
      randomMeshes: managers,
      antialias,
      audio,
      bloomPass,
      scene,
      lights,
      particleSystems: { flame, smoke, sparks },
    });
  }
});

//
//Settingis
//
settings({
  lights,
  renderer,
  randomMeshes: managers,
  antialias,
  audio,
  scene,
  stats,
  camPositioner: CamController.positioner,
});

//---------------------------------------------------

//
//
// Main loop
// Updates animations & renders frames
//
let bloom = config.scene.postProcessing.bloom;

const loop = new Loop();

loop.addUpdate((delta, elapsed) => {
  CamController.controls.update();
  CamController.clampCameraPosition();

  CamController.camera.updateMatrix();

  sparks.step(delta);
  flame.step(delta);
  smoke.step(delta);

  lights.fireLight.animator.update(elapsed);
});

loop.addRender(() => {
  stats.begin();

  if (bloom.enabled && !composer.passes.includes(bloomPass)) {
    composer.addPass(bloomPass);
  } else if (!bloom.enabled) {
    composer.removePass(bloomPass);
  }

  composer.render();

  stats.end();
});

loop.start();
