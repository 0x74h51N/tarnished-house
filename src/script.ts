import Stats from "stats.js";
import config from "config.json";
import {
  intro,
  credits,
  loadAssets,
  randomMeshes,
  particleSystem,
  cameraControl,
  settings,
  createSound,
  createComposer,
  createRenderer,
  createLights,
} from "./components/_index.js";
import {
  Scene,
  LoadingManager,
  TextureLoader,
  CameraHelper,
  Color,
} from "three";
import { Loop, detectLowEnd } from "./utils/_index.js";

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

const loadingManager = new LoadingManager();
const texLoader = new TextureLoader(loadingManager);

//
// Dom Manupulations
//

intro(loadingManager);
credits();

//
// Camera & Orbit Control
//
const { camera, cameraHelper, controls, clampCameraPosition } = cameraControl({
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
  camera,
});

//
//Size Update
//
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

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
const { positionalSound, onVolumeChange } = createSound({
  camera,
  loadingManager,
  toggleButtonId: "sound-toggle-btn",
  iconId: "sound-toggle-icon",
});

//
// Assetichus
//
loadAssets({
  scene,
  loadingManager,
  renderer,
  positionalSound,
  texLoader,
});

//Randommes
const managers = randomMeshes({ scene, loadingManager });

//
//Partichiles
//
const { flame, smoke, sparks } = particleSystem({ scene, texLoader, camera });

//
//Settingis
//

const stats = new Stats();
stats.showPanel(1);
stats.showPanel(0);
let guiLoaded = false;

window.addEventListener("keydown", async (e) => {
  if (e.key.toLowerCase() === "h" && !guiLoaded) {
    guiLoaded = true;
    const { setupGUI } = await import("./components/gui/_gui");
    setupGUI({
      renderer,
      camera,
      cameraHelper: cameraHelper as CameraHelper,
      randomMeshes: managers,
      antialias,
      onVolumeChange,
      bloomPass,
      scene,
      lights,
      particleSystems: { flame, smoke, sparks },
    });
  }
});

settings({
  lights,
  renderer,
  randomMeshes: managers,
  antialias,
  onVolumeChange,
  scene,
  stats,
});

//
// Animatichis
//
let bloom = config.scene.postProcessing.bloom;
scene.background = new Color(config.scene.postProcessing.fog.color);
const loop = new Loop();
loop.addUpdate((delta, elapsed) => {
  controls.update();
  clampCameraPosition();

  camera.updateMatrix();

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
