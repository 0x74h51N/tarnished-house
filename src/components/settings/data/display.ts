import config from "config.json";
import { byId } from "@/components/utils";
import { camCnfg } from "@/engine";
import { type ToneMappingKey, toneMappingMap } from "@/types/global.types";
import type { DisplaySettingsParams, GeneralControl } from "..";
import { isFullscreen, setFullscreen } from "../utils";

export function makeDisplaySettings({
  renderer,
  camera,
  toggleStats
}: DisplaySettingsParams): GeneralControl[] {
  const toneVal = renderer.toneMappingExposure;
  const fovVal = camCnfg.fov;

  return [
    {
      type: "checkbox",
      id: "fpsCounter",
      label: "Show FPS",
      checked: Boolean(config.scene.debug.fpsCounter),
      onChange: (e) => {
        toggleStats(e.target.checked);
      }
    },
    {
      type: "checkbox",
      id: "fullScreen",
      label: "FullScreen",
      checked: isFullscreen(),
      onChange: async (e) => {
        const on = e.target.checked;
        await setFullscreen(on, document.documentElement);
      }
    },
    {
      type: "range",
      id: "fov",
      label: "Cam FOV",
      min: "20",
      max: "75",
      step: "1",
      value: fovVal.toString(),
      span: "fovVal",
      hide: true,
      onChange: (e) => {
        const val = +e.target.value;
        byId("fovVal").textContent = val.toString();
        camera.fov = val;
        camera.updateProjectionMatrix();
      }
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
      hide: true,
      onChange: (e) => {
        const val = +e.target.value;
        byId("brightnessValue").textContent = val.toString();
        renderer.toneMappingExposure = val;
      }
    },
    {
      type: "select",
      id: "toneMapping",
      label: "Tone Mapping",
      options: Object.entries(toneMappingMap).map(([k]) => ({
        v: k,
        t: k,
        s: renderer.toneMapping === toneMappingMap[k as ToneMappingKey]
      })),
      onChange: (e) => {
        const v = e.target.value as ToneMappingKey;
        renderer.toneMapping = toneMappingMap[v];
      }
    }
  ];
}
