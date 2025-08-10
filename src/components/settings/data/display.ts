import config from "config.json";
import { GeneralControl, DisplaySettingsParams } from "..";
import { ToneMappingKey, toneMappingMap } from "@/types";

export function makeDisplaySettings({
  renderer,
  camera,
  stats,
}: DisplaySettingsParams): GeneralControl[] {
  const toneVal = renderer.toneMappingExposure;
  const fovVal = config.scene.camera.fov;

  return [
    {
      type: "checkbox",
      id: "fpsCounter",
      label: "Show FPS",
      checked: Boolean(config.scene.debug.fpsCounter),
      onChange: (e) => {
        if (e.target.checked) document.body.appendChild(stats.dom);
        else stats.dom.remove();
      },
    },
    {
      type: "range",
      id: "fov",
      label: "Cam FOV",
      min: "25",
      max: "90",
      step: "1",
      value: fovVal.toString(),
      span: "fovVal",
      hide: true,
      onChange: (e) => {
        const val = +e.target.value;
        document.getElementById("fovVal")!.textContent = val.toString();
        camera.fov = val;
        camera.updateProjectionMatrix();
      },
    },

    {
      type: "range",
      id: "brightness",
      label: "Brightness",
      min: "0",
      max: "2",
      step: "0.1",
      value: toneVal.toString(),
      span: "brightnessValue",
      onChange: (e) => {
        const val = +e.target.value;
        document.getElementById("brightnessValue")!.textContent =
          val.toString();
        renderer.toneMappingExposure = val;
      },
    },
    {
      type: "select",
      id: "toneMapping",
      label: "Tone Mapping",
      options: Object.entries(toneMappingMap).map(([k]) => ({
        v: k,
        t: k,
        s: renderer.toneMapping == toneMappingMap[k as ToneMappingKey],
      })),
      onChange: (e) => {
        const v = e.target!.value as ToneMappingKey;
        renderer.toneMapping = toneMappingMap[v];
      },
    },
  ];
}
