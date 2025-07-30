import { OrbitControls } from "three/examples/jsm/Addons";
import config from "config.json";
import { ControlOptions, ControlReturn } from "./types";

export function setupControls({
  camera,
  canvas,
}: ControlOptions): ControlReturn {
  const controls = new OrbitControls(camera, canvas);
  const cfg = config.scene.camera.controls;

  controls.enableDamping = true;
  controls.dampingFactor = cfg.dampingFactor;
  controls.screenSpacePanning = true;
  controls.enablePan = true;
  controls.panSpeed = cfg.panSpeed;
  controls.rotateSpeed = cfg.rotateSpeed;
  controls.minDistance = cfg.minDistance;
  controls.maxDistance = cfg.maxDistance;
  controls.minPolarAngle = cfg.minPolarAngle;
  controls.maxPolarAngle = cfg.maxPolarAngle;

  return { controls };
}
