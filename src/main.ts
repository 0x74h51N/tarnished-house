import Stats from "stats.js";
import config from "config.json";
import assets from "assets.json";
import {
  settings,
  initIntroModal,
  setupToggleButton,
  initCreditsModal,
  initScreenshotButton,
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
} from "./engine";
import { AudioBundle } from "./types";
import { createSizes } from "./utils/windowSize";
import { Bonfire, createIgniteBtn } from "./prefabs";

//
// Mobile Detection & Performance Optimization
//
applyLowEnd();

const showEnterButton = initIntroModal();

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

const renderer = createRenderer({ sizes, canvas, antialias });

//Postprocessing

const { composer, bloomPass } = createComposer({
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

const { btn, updateIcon } = setupToggleButton(); // Settings and audio mute button

let audioUnlocked = false;
let muted = true;
const targetVolume = config.scene.audio.volume;

function setMuted(val: boolean) {
  muted = val;
  const v = muted ? 0 : targetVolume;
  setVol(v);
  updateIcon(v);
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

btn.addEventListener("click", () => setMuted(!muted), { passive: true });

const audio: AudioBundle = {
  setVolume: setVol,
  updateIcon: updateIcon,
};

//
// Randomized mesh placement system (e.g. graves, trees, etc.)
let managers: ManagerRefs | undefined;

loadingManager.onLoad = () => {
  showEnterButton(startAudio);
  initCreditsModal();
};

//
// Lights
//

const lights = createLights(scene);

//
// Ignite Button
const { button: igniteBtn, dispose } = createIgniteBtn({
  camera: CamController.camera,
  canvas,
  onClick: () => {
    bonfire.ignite();
    scene.remove(igniteBtn);
    dispose();
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
  bonfire.attachIgnite(s);
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
const stats = new Stats();
stats.showPanel(1);
stats.showPanel(0);

let guiLoaded = false;

randomMeshes({ scene }).then((m) => {
  managers = m;

  window.addEventListener("keydown", async (e) => {
    if (e.key.toLowerCase() === "h" && !guiLoaded) {
      guiLoaded = true;
      const { initSetupGUI } = await import("./components");
      initSetupGUI({
        renderer,
        CamController,
        randomMeshes: managers!,
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
    randomMeshes: managers!,
    antialias,
    audio,
    scene,
    stats,
    CamController,
  });

  initScreenshotButton({ renderer, composer });
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

  bonfire!.step(delta, elapsed);
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
