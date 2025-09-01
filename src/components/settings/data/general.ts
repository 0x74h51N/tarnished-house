import config from "config.json";
import { byId } from "@/components/utils";
import type { GeneralControl, GeneralSettingsParams } from "..";

export function makeGeneralSettings({
  audio
}: GeneralSettingsParams): GeneralControl[] {
  const volumeVal =
    typeof config.scene.audio.volume === "number"
      ? config.scene.audio.volume * 100
      : 0;

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
        byId("volumeValue").textContent = val.toString();
        audio.setVol(val / 100);
        audio.updtMuteIcon(val / 100);
      }
    }
  ];
}
