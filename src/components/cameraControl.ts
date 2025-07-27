import { Scene, PerspectiveCamera, CameraHelper, MathUtils } from "three";
import config from "config.json";
import { OrbitControls } from "three/examples/jsm/Addons";
interface CameraControlOptions {
  scene: Scene;
  canvas: HTMLCanvasElement;
  sizes: { width: number; height: number };
}

interface CameraControlReturn {
  camera: PerspectiveCamera;
  cameraHelper: CameraHelper | null;
  controls: OrbitControls;
  clampCameraPosition: () => void;
}

export function cameraControl({
  scene,
  canvas,
  sizes,
}: CameraControlOptions): CameraControlReturn {
  const camera = new PerspectiveCamera(
    config.scene.camera.fov,
    sizes.width / sizes.height,
    config.scene.camera.near,
    config.scene.camera.far
  );
  camera.position.set(
    config.scene.camera.position.x,
    config.scene.camera.position.y,
    config.scene.camera.position.z
  );
  scene.add(camera);

  let cameraHelper = null;
  if (config.scene.debug.cameraHelper) {
    cameraHelper = new CameraHelper(camera);
    scene.add(cameraHelper);
  }

  // Orbit Controls
  const controls = new OrbitControls(camera, canvas);
  const controlsConfig = config.scene.camera.controls;

  controls.enableDamping = true;
  controls.dampingFactor = controlsConfig.dampingFactor;
  controls.screenSpacePanning = true;
  controls.enablePan = true;
  controls.panSpeed = controlsConfig.panSpeed;
  controls.rotateSpeed = controlsConfig.rotateSpeed;

  controls.minDistance = controlsConfig.minDistance;
  controls.maxDistance = controlsConfig.maxDistance;
  controls.minPolarAngle = controlsConfig.minPolarAngle;
  controls.maxPolarAngle = controlsConfig.maxPolarAngle;

  // Clamping limits
  const limits = {
    minY: controlsConfig.positionLimits.y.min,
    maxY: controlsConfig.positionLimits.y.max,
    minX: controlsConfig.positionLimits.x.min,
    maxX: controlsConfig.positionLimits.x.max,
    minZ: controlsConfig.positionLimits.z.min,
    maxZ: controlsConfig.positionLimits.z.max,
  };

  function clampAxis(axis: "x" | "y" | "z") {
    const min = limits[("min" + axis.toUpperCase()) as keyof typeof limits];
    const max = limits[("max" + axis.toUpperCase()) as keyof typeof limits];
    camera.position[axis] = MathUtils.lerp(
      camera.position[axis],
      MathUtils.clamp(camera.position[axis], min, max),
      controlsConfig.lerpFactor
    );
  }

  function clampCameraPosition() {
    (["x", "y", "z"] as const).forEach(clampAxis);
  }

  return { camera, cameraHelper, controls, clampCameraPosition };
}
