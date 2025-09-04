import config from "config.json";
import { byId } from "@/components/utils";
import { camCnfg } from "@/engine";
import type { GeneralControl, GeneralSettingsParams } from "..";

export function makeGeneralSettings({
  audio
}: GeneralSettingsParams): GeneralControl[] {
  const volumeVal =
    typeof config.scene.audio.volume === "number"
      ? config.scene.audio.volume * 100
      : 0;

  const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const controls: GeneralControl[] = [
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
        const v = +e.target.value;
        byId("volumeValue").textContent = v.toString();
        audio.setVol(v / 100);
        audio.updtMuteIcon(v / 100);
      }
    }
  ];
  if (isTouch) {
    controls.push({
      type: "range",
      id: "touchSens",
      label: "Look Sensitivity",
      min: "0.1",
      max: "1",
      step: "0.01",
      value: (camCnfg.controls.touchSens * 100).toFixed(2),
      span: "sensValue",
      onChange: (e) => {
        const v = +e.target.value;
        camCnfg.controls.touchSens = v / 100;
        byId("sensValue").textContent = v.toFixed(2);
      }
    });
  } else {
    controls.push({
      type: "range",
      id: "mouseSens",
      label: "Mouse Sensitivity",
      min: "0.1",
      max: "1",
      step: "0.01",
      value: (camCnfg.controls.mouseSens * 1000).toFixed(2),
      span: "sensValue",
      onChange: (e) => {
        const v = +e.target.value;
        camCnfg.controls.mouseSens = v / 1000;
        byId("sensValue").textContent = v.toFixed(2);
      }
    });
  }

  return controls;
}
