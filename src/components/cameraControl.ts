import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import config from "../../config.json";
interface CameraControlOptions {
  scene: THREE.Scene;
  canvas: HTMLCanvasElement;
  sizes: { width: number; height: number };
}

interface CameraControlReturn {
  camera: THREE.PerspectiveCamera;
  cameraHelper: THREE.CameraHelper | null;
  controls: OrbitControls;
  clampCameraPosition: () => void;
}

export function cameraControl({
  scene,
  canvas,
  sizes,
}: CameraControlOptions): CameraControlReturn {
  const { params } = config;

  const camera = new THREE.PerspectiveCamera(
    params.cameraFov,
    sizes.width / sizes.height,
    params.cameraNear,
    params.cameraFar
  );
  camera.position.set(params.cameraX, params.cameraY, params.cameraZ);
  scene.add(camera);

  let cameraHelper = null;
  if (params.cameraHelper) {
    cameraHelper = new THREE.CameraHelper(camera);
    scene.add(cameraHelper);
  }

  // Orbit Controls
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.03;
  controls.screenSpacePanning = true;
  controls.enablePan = true;
  controls.panSpeed = 0.6;
  controls.rotateSpeed = 0.8;

  controls.minDistance = 2;
  controls.maxDistance = 50;
  controls.minPolarAngle = Math.PI / 6;
  controls.maxPolarAngle = Math.PI / 2;

  // Clamping limits
  const limits = {
    minY: 1,
    maxY: 12,
    minX: -16,
    maxX: 16,
    minZ: -16,
    maxZ: 16,
  };

  function clampAxis(axis: "x" | "y" | "z") {
    const min = limits[("min" + axis.toUpperCase()) as keyof typeof limits];
    const max = limits[("max" + axis.toUpperCase()) as keyof typeof limits];
    camera.position[axis] = THREE.MathUtils.lerp(
      camera.position[axis],
      THREE.MathUtils.clamp(camera.position[axis], min, max),
      0.2
    );
  }

  function clampCameraPosition() {
    (["x", "y", "z"] as const).forEach(clampAxis);
  }

  return { camera, cameraHelper, controls, clampCameraPosition };
}
