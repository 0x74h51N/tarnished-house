import Stats from "stats.js";
import config from "../config.json";
import {
  intro,
  credits,
  loadAssets,
  particles,
  lights,
  cameraControl,
  settings,
  createSound,
  createComposer,
  createRenderer,
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

const {
  ambientLight,
  fireLight,
  fireLightHelper,
  directionalLight,
  directionalLightHelper,
  directionalLightCameraHelper,
  fireAnimator,
} = lights(scene);

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
// Assets
//

const { managers } = loadAssets({
  scene,
  loadingManager,
  renderer,
  positionalSound,
  texLoader,
});

const { flame, smoke, sparks } = particles({ scene, texLoader, camera });

//
//Settings
//

const lightArr = [fireLight, directionalLight];

const stats = new Stats();
stats.showPanel(1);
stats.showPanel(0);
let guiLoaded = false;

window.addEventListener("keydown", async (e) => {
  if (e.key.toLowerCase() === "h" && !guiLoaded) {
    guiLoaded = true;
    const { setupGUI } = await import("./components/setupGui");
    setupGUI({
      renderer,
      fireLightHelper,
      directionalLightHelper,
      directionalLightCameraHelper,
      ambientLight,
      camera,
      cameraHelper: cameraHelper as CameraHelper,
      gltfAssets: managers,
      antialias,
      onVolumeChange,
      bloomPass,
      scene,
      lights: lightArr,
    });
  }
});

settings({
  lights: lightArr,
  renderer,
  gltfAssets: managers,
  antialias,
  onVolumeChange,
  scene,
  stats,
});

//
// Animate
//
let bloom = config.scene.postProcessing.bloom;
scene.background = new Color(config.scene.postProcessing.fog.color);
const loop = new Loop();
loop.addUpdate((delta, elapsed) => {
  controls.update();
  clampCameraPosition();

  camera.updateMatrix();
  const wm = camera.matrixWorld.elements;

  sparks.step({ delta });
  flame.step({ delta });
  smoke.step({ delta });

  fireAnimator.updateFireLight(elapsed);
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
