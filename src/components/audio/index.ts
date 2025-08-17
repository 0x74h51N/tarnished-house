import { IconUpdt, VolumeSetter } from "@/types/global.types";

export function setupToggleButton(): {
  muteBtn: HTMLElement;
  updtMuteIcon: IconUpdt;
} {
  const muteBtn = document.getElementById("sound-toggle-btn")!;
  const icon = document.getElementById(
    "sound-toggle-icon"
  )! as HTMLImageElement;

  const updtMuteIcon: VolumeSetter = (volume) => {
    icon.src = volume > 0 ? "/sound.svg" : "/sound-off.svg";
    icon.alt = volume > 0 ? "Sound on" : "Sound off";
  };

  return { muteBtn, updtMuteIcon };
}
