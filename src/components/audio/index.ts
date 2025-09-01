import type { IconUpdt, VolumeSetter } from "@/types/global.types";
import { byId } from "../utils";

export function setupToggleButton(): {
  muteBtn: HTMLElement;
  updtMuteIcon: IconUpdt;
} {
  const muteBtn = byId<HTMLButtonElement>("sound-toggle-btn");
  const icon = byId<HTMLImageElement>("sound-toggle-icon");

  const updtMuteIcon: VolumeSetter = (volume) => {
    icon.src = volume > 0 ? "/sound.svg" : "/sound-off.svg";
    icon.alt = volume > 0 ? "Sound on" : "Sound off";
  };

  return { muteBtn, updtMuteIcon };
}
