import { IconUpdt, VolumeSetter } from "@/types";

export function setupToggleButton(): {
  btn: HTMLElement;
  updateIcon: IconUpdt;
} {
  const btn = document.getElementById("sound-toggle-btn")!;
  const icon = document.getElementById(
    "sound-toggle-icon"
  )! as HTMLImageElement;

  const updateIcon: VolumeSetter = (volume) => {
    icon.src = volume > 0 ? "/sound.svg" : "/sound-off.svg";
    icon.alt = volume > 0 ? "Sound on" : "Sound off";
  };

  return { btn, updateIcon };
}
