import config from "config.json";
import { GeneralControl, GeneralSettingsParams } from "..";

export function makeGeneralSettings({
  renderer,
  audio,
}: GeneralSettingsParams): GeneralControl[] {
  const volumeVal =
    typeof config.scene.audio.volume === "number"
      ? config.scene.audio.volume * 100
      : 0;
  const toneVal = renderer.toneMappingExposure;

  return [
    {
      type: "range",
      id: "volume",
      label: "Volume",
      min: "0",
      max: "100",
      step: "1",
      value: volumeVal.toString(),
      span: "volumeValue",
      onChange: (e) => {
        const val = +e.target.value;
        document.getElementById("volumeValue")!.textContent = String(val);
        audio.setVolume(val / 100);
        audio.updateIcon(val / 100);
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
        document.getElementById("brightnessValue")!.textContent = String(val);
        renderer.toneMappingExposure = val;
      },
    },
  ];
}
