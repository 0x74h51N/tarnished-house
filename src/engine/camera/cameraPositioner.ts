import {
  CameraPositionerInterface,
  CameraPositionerReturn,
  PositionArgs,
} from "./types";

export function createCamPositioner({
  camera,
  controls,
}: CameraPositionerInterface): CameraPositionerReturn {
  const initialCameraPos = camera.position.clone();
  const initialTarget = controls.target.clone();

  const setPosition = ({ targetPos, cameraPos }: PositionArgs) => {
    controls.enabled = false;
    controls.target.copy(targetPos);
    camera.position.copy(cameraPos);
    camera.lookAt(controls.target);
    controls.update();
  };

  const restorePosition = () => {
    controls.enabled = false;

    controls.target.copy(initialTarget);
    camera.position.copy(initialCameraPos);
    camera.lookAt(initialTarget);
    controls.update();

    controls.enabled = true;
  };

  return { setPosition, restorePosition };
}
