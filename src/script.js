import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Timer } from "three/addons/misc/Timer.js";
import { setupGUI } from "./settings.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  spawnMeshes,
  addRoots,
  centerGeometryXZ,
  createSimpleParticles,
} from "./utils/_index.js";
import Stats from "stats.js";
import {
  params,
  bushOptions,
  graveOptions,
  rootPositions,
  treeOptions,
} from ".././config.json";
import assets from ".././assets.json";
import { Sky } from "three/examples/jsm/Addons.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

//
//#region credits
//

const creditsBtn = document.getElementById("credits-btn");
const creditsModal = document.getElementById("credits-modal");
const closeModal = document.getElementById("close-credits");

creditsBtn.addEventListener("click", () => {
  creditsModal.classList.add("active");
  creditsModal.classList.remove("hidden");
});

closeModal.addEventListener("click", () => {
  creditsModal.classList.remove("active");
  setTimeout(() => creditsModal.classList.add("hidden"), 400);
});

creditsModal.addEventListener("click", (e) => {
  if (e.target === creditsModal) {
    creditsModal.classList.remove("active");
    setTimeout(() => creditsModal.classList.add("hidden"), 400);
  }
});

function renderAssetList() {
  const assetList = document.getElementById("asset-list");
  assetList.innerHTML = assets
    .map(
      (asset) => `
    <li class="asset-card">
      <strong>${asset.type}</strong>
      <div class="asset-author">Author: ${asset.author}</div>
      <div class="asset-source">
        Source: <a href="${asset.source.url}" target="_blank">${asset.source.name}</a>
      </div>
      <div class="asset-license">License: ${asset.license}</div>
    </li>
  `
    )
    .join("");
}

renderAssetList();

//
//
// #endregion

const canvas = document.querySelector("canvas.webgl");

const scene = new THREE.Scene();

//
//#region asset loader
//

/**
 * Texture Load
 */
const closeIntro = document.getElementById("close-intro");
const introModal = document.getElementById("intro-modal");

if (closeIntro && introModal) {
  closeIntro.addEventListener("click", () => {
    introModal.classList.remove("active");
    setTimeout(() => introModal.classList.add("hidden"), 400);
  });
}

const loadingManager = new THREE.LoadingManager();
loadingManager.onLoad = () => {
  const loadingScreen = document.getElementById("loading-screen");
  if (loadingScreen) {
    loadingScreen.classList.add("hidden");
    setTimeout(() => {
      loadingScreen.style.display = "none";
    }, 600);
  }

  if (introModal) {
    introModal.classList.remove("hidden");
    introModal.classList.add("active");
    setTimeout(() => {
      introModal.classList.remove("active");
      introModal.classList.add("hidden");
    }, 9000);
  }
};

const texLoader = new THREE.TextureLoader(loadingManager);
const baseColorTex = texLoader.load(
  "./floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_diff_1k.webp"
);
const normalTex = texLoader.load(
  "./floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_nor_gl_1k.webp"
);
const armTex = texLoader.load(
  "./floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_arm_1k.webp"
);
const displacementTex = texLoader.load(
  "./floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_disp_1k.webp"
);

const floorAlphaTex = texLoader.load("./floor/alpha.jpg");

// /**
//  * House
//  */
const gltfLoader = new GLTFLoader(loadingManager);

gltfLoader.load("./abandoned_house/scene.gltf", (gltf) => {
  const house = gltf.scene;
  house.position.set(0.02, 0.25, -5.5);
  house.scale.setScalar(1.2);
  gltf.scene.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  scene.add(house);
});

// /**
//  * Trees
//  */
const treesGroup = new THREE.Group();
const trees = {
  treeBaseMeshes: [],
  treeGLTF: null,
  treesGroup,
};

gltfLoader.load("./trees/trees.glb", (gltf) => {
  trees.treeGLTF = gltf;
  trees.treeBaseMeshes =
    trees.treeGLTF.scene.children[0].children[0].children[0].children;
  spawnMeshes(
    trees.treeBaseMeshes,
    trees.treesGroup,
    params.treeCount,
    treeOptions
  );
  scene.add(trees.treesGroup);
});

// /**
//  *  Bushes
//  */

const bushGroup = new THREE.Group();
const bushes = {
  bushBaseMeshes: [],
  busheGLTF: null,
  bushGroup,
};
gltfLoader.load("./burchellii/searsia_burchellii_1k.gltf", (gltf) => {
  bushes.bushGLTF = gltf;
  bushes.bushBaseMeshes = [
    gltf.scene.children[0],
    gltf.scene.children[1],
    gltf.scene.children[2],
  ];
  spawnMeshes(
    bushes.bushBaseMeshes,
    bushes.bushGroup,
    params.bushCount,
    bushOptions
  );
  scene.add(bushes.bushGroup);
});

// /**
//  * Graves
//  */
const graveGroup = new THREE.Group();

const graves = {
  graveBaseMeshes: [],
  graveGLTF: null,
  graveGroup,
};

gltfLoader.load("./gravestones/scene.gltf", (gltf) => {
  graves.graveGLTF = gltf;
  graves.graveBaseMeshes = [];
  gltf.scene.traverse((child) => {
    if (child.isMesh) {
      centerGeometryXZ(child.geometry);
      child.position.set(0, 0, 0);
      child.rotation.set(0, 0, 0);
      child.rotateY(Math.PI * 0.5);
      graves.graveBaseMeshes.push(child);
    }
  });

  spawnMeshes(
    graves.graveBaseMeshes,
    graves.graveGroup,
    params.graveCount,
    graveOptions
  );
  scene.add(graves.graveGroup);
});

// /**
//  *  Pine Roots
//  */

gltfLoader.load("./pineroots/pine_roots.gltf", (gltf) => {
  const groupCount = 9;

  for (let i = 0; i < groupCount; i++) {
    const group = new THREE.Group();

    const baseAngle = Math.random() * Math.PI * 4;
    const rotA = [0, baseAngle, 0];
    const rotB = [0, baseAngle * 2, 0];

    const A = gltf.scene.children[0].clone();
    const B = gltf.scene.children[1].clone();

    addRoots(
      A,
      B,
      rootPositions[i % rootPositions.length],
      rotA,
      rootPositions[i % rootPositions.length],
      rotB,
      3,
      group
    );
    scene.add(group);
  }
});

// /**
//  * Bonfire
//  */

gltfLoader.load("./bonfire/bonfire_dark_souls_saga.glb", (g) => {
  const bonfire = g.scene.children[0];
  bonfire.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
    }
  });

  bonfire.scale.setScalar(0.4);
  bonfire.position.set(0, 0.25, 1.5);
  bonfire.add(positionalSound);
  scene.add(bonfire);
});

//
//#endregion
//

//
//#region floor
//

const repeat = 12;
baseColorTex.colorSpace = THREE.SRGBColorSpace;
baseColorTex.repeat.set(repeat, repeat);
baseColorTex.wrapS = THREE.RepeatWrapping;
baseColorTex.wrapT = THREE.RepeatWrapping;

normalTex.repeat.set(repeat, repeat);
normalTex.wrapS = THREE.RepeatWrapping;
normalTex.wrapT = THREE.RepeatWrapping;

armTex.repeat.set(repeat, repeat);
armTex.wrapS = THREE.RepeatWrapping;
armTex.wrapT = THREE.RepeatWrapping;

displacementTex.repeat.set(repeat, repeat);
displacementTex.wrapS = THREE.RepeatWrapping;
displacementTex.wrapT = THREE.RepeatWrapping;

const floorGeometry = new THREE.PlaneGeometry(43, 43, 250, 250);
const floorMaterial = new THREE.MeshStandardMaterial({
  alphaMap: floorAlphaTex,
  transparent: true,
  map: baseColorTex,
  normalMap: normalTex,
  aoMap: armTex,
  metalnessMap: armTex,
  roughnessMap: armTex,
  displacementMap: displacementTex,
  displacementScale: 0.2,
  side: THREE.DoubleSide,
  color: 0xcccccc,
});

const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.receiveShadow = true;
floor.rotation.x = -Math.PI * 0.5;

scene.add(floor);

//
//#endregion
//

//
//#region lights

// Ambient light
const ambientLight = new THREE.AmbientLight(
  params.ambientLightColor,
  params.ambientLightIntensity
);
scene.add(ambientLight);

//pointLight
const fireLight = new THREE.PointLight(
  0xffa500,
  params.fireLightIntensity,
  params.fireLightDistance,
  2
);
fireLight.castShadow = true;
fireLight.shadow.mapSize.set(params.shadowMapSize, params.shadowMapSize);
fireLight.position.set(0, 1, 1.5);

fireLight.shadow.bias = params.shadowBias;
fireLight.shadow.normalBias = params.shadowNormalBias;

scene.add(fireLight);

const fireLightHelper = new THREE.PointLightHelper(fireLight, 0.2);

// Directional light
const directionalLight = new THREE.DirectionalLight(
  params.directionalLightColor,
  params.directionalLightIntensity
);
directionalLight.position.set(
  params.directionalLightX,
  params.directionalLightY,
  params.directionalLightZ
);
directionalLight.castShadow = true;

const halfW = params.shadowCameraWidth / 2;
const halfH = params.shadowCameraHeight / 2;
directionalLight.shadow.camera.left = -halfW;
directionalLight.shadow.camera.right = halfW;
directionalLight.shadow.camera.top = halfH;
directionalLight.shadow.camera.bottom = -halfH;
directionalLight.shadow.camera.near = params.shadowCameraNear;
directionalLight.shadow.camera.far = params.shadowCameraFar;
directionalLight.shadow.camera.updateProjectionMatrix();

directionalLight.shadow.bias = params.shadowBias;
directionalLight.shadow.normalBias = params.shadowNormalBias;

directionalLight.target.position.set(0, 0, 0);
scene.add(directionalLight.target);

const directionalLightHelper = new THREE.DirectionalLightHelper(
  directionalLight,
  1
);

const directionalLightCameraHelper = new THREE.CameraHelper(
  directionalLight.shadow.camera
);

scene.add(directionalLight);

//
//
//#endregion
//

//
//#region window size
//

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

//
//
//#endregion
//

//
//#region camera
//

const camera = new THREE.PerspectiveCamera(
  params.cameraFov,
  sizes.width / sizes.height,
  params.cameraNear,
  params.cameraFar
);
camera.position.set(params.cameraX, params.cameraY, params.cameraZ);
scene.add(camera);

const cameraHelper = new THREE.CameraHelper(camera);
if (params.cameraHelper) scene.add(cameraHelper);

//
//
//#endregion
//

//
//#region sky
//

const sky = new Sky();
sky.scale.setScalar(100);
scene.add(sky);

const skyUniforms = sky.material.uniforms;
skyUniforms["turbidity"].value = 50;
skyUniforms["rayleigh"].value = 0;
skyUniforms["mieCoefficient"].value = 0.2;
skyUniforms["mieDirectionalG"].value = 0;
skyUniforms["sunPosition"].value.set(0, -0.08, -1);

const moonTexture = texLoader.load("/moon.jpg");
const emissiveMap = texLoader.load("/moon-emissive.jpg");
const moon = new THREE.Mesh(
  new THREE.PlaneGeometry(1.7, 1.7),
  new THREE.MeshPhysicalMaterial({
    map: moonTexture,
    transparent: true,
    blending: THREE.AdditiveBlending,
    color: 0xffffff,
    opacity: 1,
    alphaMap: moonTexture,
    emissive: 0xffffff,
    emissiveIntensity: 6,
    toneMapped: false,
    emissiveMap: emissiveMap,
  })
);

const moonDistance = directionalLight.position.length() * 2;
const moonDirection = directionalLight.position.clone().normalize();
moon.position.copy(moonDirection.multiplyScalar(moonDistance));

moon.lookAt(camera.position);
scene.add(moon);

//
//#endregion
//

//
//#region controls
//

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.screenSpacePanning = true;
controls.enablePan = true;
controls.panSpeed = 0.6;
controls.rotateSpeed = 0.8;

controls.minDistance = 2;
controls.maxDistance = 50;
controls.minPolarAngle = Math.PI / 6;
controls.maxPolarAngle = Math.PI / 2;

const limits = {
  minY: 1,
  maxY: 12,
  minX: -15,
  maxX: 15,
  minZ: -15,
  maxZ: 15,
};

function clampCameraPosition() {
  camera.position.x = THREE.MathUtils.clamp(
    camera.position.x,
    limits.minX,
    limits.maxX
  );
  camera.position.y = THREE.MathUtils.clamp(
    camera.position.y,
    limits.minY,
    limits.maxY
  );
  camera.position.z = THREE.MathUtils.clamp(
    camera.position.z,
    limits.minZ,
    limits.maxZ
  );
}

//

//
//#endregion
//

//
//#region renderer
//
let antialias = localStorage.getItem("antialias");
if (antialias === null) antialias = "false";
antialias = antialias === "true";

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: antialias,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = params.toneMappingExposure;

//

//
//#endregion
//

//
//#region postprocessing
//

const composer = new EffectComposer(renderer);

composer.addPass(new RenderPass(scene, camera));
const bloomParams = params.bloomParams;

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  bloomParams.strength,
  bloomParams.radius,
  bloomParams.threshold
);
composer.addPass(bloomPass);

const fog = new THREE.FogExp2(directionalLight.color, 0.02);
scene.fog = fog;
function fogOnChange(e) {
  if (e.target.checked) {
    params.fog = true;
    scene.fog = fog;
  } else {
    params.fog = false;
    scene.fog = null;
  }
}
//
//#endregion
//

//
//#region sounds
//
const listener = new THREE.AudioListener();
camera.add(listener);

const audioLoader = new THREE.AudioLoader(loadingManager);

const positionalSound = new THREE.PositionalAudio(listener);
let soundLoaded = false;
audioLoader.load("/sounds/fire.wav", (buffer) => {
  positionalSound.setBuffer(buffer);
  positionalSound.setRefDistance(3);
  positionalSound.setLoop(true);
  positionalSound.setVolume(params.volume * 0.8);
  soundLoaded = true;
});

const ambianceSound = new THREE.Audio(listener);
let ambianceLoaded = false;
audioLoader.load("/sounds/ambiance.flac", (buffer) => {
  ambianceSound.setBuffer(buffer);
  ambianceSound.setLoop(true);
  ambianceSound.setVolume(params.volume);
  ambianceLoaded = true;
});

const soundBtn = document.getElementById("sound-toggle-btn");
const soundIcon = document.getElementById("sound-toggle-icon");
let isMuted = true;

soundBtn.addEventListener("click", () => {
  isMuted = !isMuted;
  if (isMuted) {
    positionalSound.setVolume(0);
    ambianceSound.setVolume(0);
    soundIcon.src = "/sound-off.svg";
    soundIcon.alt = "Sound off";
  } else {
    positionalSound.setVolume(params.volume * 0.8);
    ambianceSound.setVolume(params.volume);
    if (soundLoaded && !positionalSound.isPlaying) positionalSound.play();
    if (ambianceLoaded && !ambianceSound.isPlaying) ambianceSound.play();
    soundIcon.src = "/sound.svg";
    soundIcon.alt = "Sound on";
  }
});
//
//#endregion
//

//
//#region particles
//

const flamePath = ["fire/flame1.jpg", "fire/flame2.jpg", "fire/flame3.jpg"];
const flameAlphaPath = [
  "fire/flame1-alpha.png",
  "fire/flame2-alpha.png",
  "fire/flame3-alpha.png",
];

const flameTextures = flamePath.map((p) => {
  const tex = texLoader.load(p, (t) => {
    t.encoding = THREE.sRGBEncoding;
  });
  return tex;
});
const maskTextures = flameAlphaPath.map((p) => {
  const tex = texLoader.load(p, (t) => {
    t.generateMipmaps = false;
    t.minFilter = THREE.LinearFilter;
    t.magFilter = THREE.LinearFilter;
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    t.format = THREE.RGBAFormat;
  });
  return tex;
});

const flame = createSimpleParticles({
  parent: scene,
  area: 0.2,
  size: 0.4,
  maxCount: 7,
  spawnRate: 18,
  yStart: 0.35,
  textures: flameTextures,
  maskTextures,
  camera,
  opacity: 0.26,
});
flame.points.forEach((p) => {
  p.position.z = 1.5;
});

const smokePath = [
  "smoke/smoke1.png",
  "smoke/smoke2.png",
  "smoke/smoke3.png",
  "smoke/smoke4.png",
];

const smokeTextures = smokePath.map((p) => texLoader.load(p));

const smoke = createSimpleParticles({
  parent: scene,
  area: 0.3,
  size: 0.7,
  maxCount: 30,
  spawnRate: 2,
  yStart: 1.1,
  textures: smokeTextures,
  camera,
  opacity: 0.4,
  color: 0x444444,
  sizeGrowth: 0.3,
});
smoke.points.forEach((p) => (p.position.z = 1.5));

const sparks = createSimpleParticles({
  parent: scene,
  color: "#fff",
  area: 0.3,
  size: 0.001,
  maxCount: 100,
  spawnRate: 11,
  yStart: 0.15,
  camera,
});
sparks.points.forEach((p) => (p.position.z = 1.5));

//

//
//#endregion
//

//
//#region Settings

setupGUI({
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
  graves,
  bushes,
  trees,
  antialias,
  onVolumeChange: (v) => {
    positionalSound.setVolume(v);
    ambianceSound.setVolume(v * 0.8);
    if (soundLoaded && !positionalSound.isPlaying) {
      positionalSound.play();
      soundIcon.src = "/sound.svg";
      soundIcon.alt = "Sound on";
    }
    if (ambianceLoaded && !ambianceSound.isPlaying) {
      ambianceSound.play();
    }
  },
  skyUniforms,
  bloomPass,
  fogOnChange,
  scene,
});

// #endregion
//

//
//#region Animate
//

const stats = new Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);
const firelightAnimation = params.fireLightAnimation;
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
  moon.lookAt(camera.position);

  // Shadow enabled
  sparks.step(delta);
  flame.step(delta);
  smoke.step(delta);

  // helpers
  directionalLightHelper.update();
  directionalLightCameraHelper.update();

  fireLight.intensity =
    params.fireLightIntensity +
    Math.sin(elapsedTime * firelightAnimation.intensitySpeed) *
      firelightAnimation.intensityAmp;

  fireLight.position.y =
    1 +
    Math.sin(elapsedTime * firelightAnimation.positionSpeed) *
      firelightAnimation.positionAmp;

  fireLight.distance =
    params.fireLightDistance +
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
