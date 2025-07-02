import Stats from "stats.js";
import { params } from "../config.json";
import {
  intro,
  credits,
  loadAssets,
  createSky,
  particles,
  lights,
  cameraControl,
  settings,
  createSound,
  createComposer,
  createRenderer,
} from "./components/_index.js";
import { Scene, LoadingManager, TextureLoader, CameraHelper } from "three";
import { Loop } from "./utils/_index.js";

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
} = lights(scene);

//
// renderer
//

const antialias = localStorage.getItem("antialias") === "true";

const renderer = createRenderer({ sizes, canvas, antialias });

//Postprocessing

const { composer, bloomPass } = createComposer({ renderer, scene, camera });

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

const gltfAssets = loadAssets({
  scene,
  loadingManager,
  renderer,
  positionalSound,
  texLoader,
});

const { update: updateMoon } = createSky({
  scene,
  texLoader,
  directionalLight,
  camera,
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
      gltfAssets,
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
  gltfAssets,
  antialias,
  onVolumeChange,
  scene,
  stats,
});

//
// Animate
//

const flParams = params.fireLight;

const fireAnim = flParams.animation;

const loop = new Loop();

loop.addUpdate(() => controls.update());
loop.addUpdate(() => clampCameraPosition());
loop.addUpdate((delta) => sparks.step(delta));
loop.addUpdate((delta) => flame.step(delta));
loop.addUpdate((delta) => smoke.step(delta));
loop.addUpdate((elapsed) => {
  fireLight.intensity =
    flParams.intensity +
    Math.sin(elapsed * fireAnim.intensitySpeed) * fireAnim.intensityAmp;
  fireLight.position.y =
    flParams.positions.y +
    Math.sin(elapsed * fireAnim.positionSpeed) * fireAnim.positionAmp;

  fireLight.distance =
    flParams.distance +
    Math.sin(elapsed * fireAnim.distanceSpeed) * fireAnim.distanceAmp;
});

loop.addRender(() => {
  stats.begin();

  const haveBloom = composer.passes.includes(bloomPass);
  if (params.bloomParams.enabled && !haveBloom) {
    composer.addPass(bloomPass);
  } else if (!params.bloomParams.enabled && haveBloom) {
    composer.removePass(bloomPass);
  }

  composer.render();

  stats.end();
});

loop.start();
