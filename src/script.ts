import { Timer } from "three/examples/jsm/misc/Timer.js";
import Stats from "stats.js";
import { params } from "../config.json";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
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
} from "./components/_index.js";
import {
  Scene,
  LoadingManager,
  TextureLoader,
  WebGLRenderer,
  PCFSoftShadowMap,
  ACESFilmicToneMapping,
  Vector2,
  CameraHelper,
} from "three";

const canvas = document.querySelector("canvas.webgl");
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const scene = new Scene();
const loadingManager = new LoadingManager();
const texLoader = new TextureLoader(loadingManager);

intro(loadingManager);

credits();

const { camera, cameraHelper, controls, clampCameraPosition } = cameraControl({
  scene,
  canvas: canvas as HTMLCanvasElement,
  sizes,
});

const {
  ambientLight,
  fireLight,
  fireLightHelper,
  directionalLight,
  directionalLightHelper,
  directionalLightCameraHelper,
} = lights(scene);

//
//#region renderer
//
let antialias = localStorage.getItem("antialias") || false;
antialias = antialias === "true";

const renderer = new WebGLRenderer({
  canvas: canvas as HTMLCanvasElement,
  antialias: antialias,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;
renderer.toneMapping = ACESFilmicToneMapping;
renderer.toneMappingExposure = params.toneMappingExposure;

//Postprocessing

const composer = new EffectComposer(renderer);

composer.addPass(new RenderPass(scene, camera));
const bloomParams = params.bloomParams;

const bloomPass = new UnrealBloomPass(
  new Vector2(window.innerWidth, window.innerHeight),
  bloomParams.strength,
  bloomParams.radius,
  bloomParams.threshold
);
composer.addPass(bloomPass);

//
//#endregion
//

const { positionalSound, onVolumeChange } = createSound({
  camera,
  loadingManager,
  toggleButtonId: "sound-toggle-btn",
  iconId: "sound-toggle-icon",
});

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
//#region Settings
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

// #endregion
//

//
//#region Animate
//
const flParams = params.fireLight;

const firelightAnimation = flParams.animation;

const timer = new Timer();

const tick = () => {
  //fps
  stats.begin();
  // Timer
  timer.update();
  const elapsedTime = timer.getElapsed();

  // Update controls
  controls.update();
  clampCameraPosition();

  const delta = timer.getDelta();

  updateMoon();

  // Shadow enabled
  sparks.step(delta);
  flame.step(delta);
  smoke.step(delta);

  // helpers
  directionalLightHelper.update();
  directionalLightCameraHelper.update();

  fireLight.intensity =
    flParams.intensity +
    Math.sin(elapsedTime * firelightAnimation.intensitySpeed) *
      firelightAnimation.intensityAmp;

  fireLight.position.y =
    flParams.positions.y +
    Math.sin(elapsedTime * firelightAnimation.positionSpeed) *
      firelightAnimation.positionAmp;

  fireLight.distance =
    flParams.distance +
    Math.sin(elapsedTime * firelightAnimation.distanceSpeed) *
      firelightAnimation.distanceAmp;

  // Render

  if (params.bloomParams.enabled && !composer.passes.includes(bloomPass)) {
    composer.addPass(bloomPass);
  }
  if (!params.bloomParams.enabled && composer.passes.includes(bloomPass)) {
    composer.passes.splice(composer.passes.indexOf(bloomPass), 1);
  }
  composer.render();

  stats.end();
  window.requestAnimationFrame(tick);
};

tick();

//
//
//
//#endregion
//
