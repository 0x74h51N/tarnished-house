import { shadowDistOpt, shadowTypes, fog } from "./settingsData.js";
import { shadowDispose, spawnMeshes } from "../../utils/_index";
import { params } from "../../../config.json";
import { AssetOptionsTypes, AssetTypes } from "types";
import {
  Light,
  WebGLRenderer,
  Scene,
  DirectionalLight,
  NoToneMapping,
  LinearToneMapping,
  ReinhardToneMapping,
  CineonToneMapping,
  ACESFilmicToneMapping,
  ToneMapping,
} from "three";
import { toneMappingMap } from "./settingsData";
interface SettingsControllerInterface {
  lights: Light[];
  renderer: WebGLRenderer;
  countConfigs: Record<
    string,
    { manager: AssetTypes; opts: AssetOptionsTypes }
  >;
  onVolumeChange: (v: number) => void;
  scene: Scene;
  stats: Stats;
}

export function settingsController({
  lights,
  renderer,
  countConfigs,
  onVolumeChange,
  scene,
  stats,
}: SettingsControllerInterface) {
  const toggleBtn = document.getElementById("settings-btn");
  const modal = document.getElementById("settings-modal");
  const closeBtn = document.getElementById("close-settings");

  const hideModal = () => {
    modal!.classList.remove("active");
    setTimeout(() => modal!.classList.add("hidden"), 400);
  };
  toggleBtn!.addEventListener("click", () => {
    modal!.classList.remove("hidden");
    modal!.classList.add("active");
  });
  closeBtn!.addEventListener("click", hideModal);
  modal!.addEventListener("click", (e) => {
    if (e.target === modal) hideModal();
  });

  const handlers = {
    volume: (e: Event & { target: HTMLInputElement }) => {
      const val = +e.target.value;
      const span = document.getElementById("volumeValue");
      if (span) span.textContent = val.toString();
      onVolumeChange && onVolumeChange(val / 100);
    },
    brightness: (e: Event & { target: HTMLInputElement }) => {
      const val = +e.target.value;
      const span = document.getElementById("brightnessValue");
      if (span) span.textContent = val.toString();
      renderer.toneMappingExposure = val;
      params.toneMappingExposure = val;
    },
    fpsCounter: (e: Event & { target: HTMLInputElement }) => {
      const v = e.target.checked;
      params.fpsCounter = v;
      if (v) {
        document.body.appendChild(stats.dom);
      } else if (stats.dom.parentElement) {
        stats.dom.parentElement.removeChild(stats.dom);
      }
    },
    antialiasing: (e: Event & { target: HTMLInputElement }) => {
      localStorage.setItem("antialias", e.target.checked.toString());
      window.location.reload();
    },
    bloomEnabled: (e: Event & { target: HTMLInputElement }) => {
      params.bloomParams.enabled = e.target.checked;
    },
    fogToggle: (e: Event & { target: HTMLInputElement }) => {
      const v = e.target.checked;
      params.fog = v;
      scene.fog = v ? fog : null;
    },
    shadowEnabled: (e: Event & { target: HTMLInputElement }) => {
      const v = e.target.checked;
      shadowDispose(lights);
      lights.forEach((l) => (l.castShadow = v));
      renderer.shadowMap.enabled = v;
      renderer.shadowMap.needsUpdate = true;
    },
    shadowDistance: (e: Event & { target: HTMLSelectElement }) => {
      const opt = shadowDistOpt.find(
        (o) => o.n.toLowerCase() === e.target.value
      );
      if (!opt) return;
      params.shadowCameraWidth = opt.w;
      params.shadowCameraFar = opt.f;
      const dirLight = lights.find((l) => l instanceof DirectionalLight);
      if (dirLight) {
        const halfW = opt.w / 2;
        dirLight.shadow.camera.left = -halfW;
        dirLight.shadow.camera.right = halfW;
        dirLight.shadow.camera.far = opt.f;
        dirLight.shadow.camera.updateProjectionMatrix();
      }
    },
    shadowResolution: (e: Event & { target: HTMLSelectElement }) => {
      const res = +e.target.value;
      shadowDispose(lights);
      lights.forEach((l) => l.shadow!.mapSize.set(res, res));
      params.shadowMapSize = res;
      renderer.shadowMap.needsUpdate = true;
    },
    shadowType: (e: Event & { target: HTMLSelectElement }) => {
      shadowDispose(lights);
      const value = (e.target as HTMLSelectElement)
        .value as keyof typeof shadowTypes;
      renderer.shadowMap.type = shadowTypes[value];
    },
    quality: (e: Event & { target: HTMLSelectElement }) => {
      let bias, normalBias;
      switch (e.target.value) {
        case "high":
          bias = -0.0005;
          normalBias = 0.06;
          break;
        case "medium":
          bias = -0.0008;
          normalBias = 0.11;
          break;
        default:
          bias = -0.02;
          normalBias = 0.2;
      }
      lights.forEach((l) => {
        l.shadow!.bias = bias;
        l.shadow!.normalBias = normalBias;
      });
      params.shadowBias = bias;
      params.shadowNormalBias = normalBias;
    },
    toneMapping: (e: Event & { target: HTMLSelectElement }) => {
      const value = e.target.value as keyof typeof toneMappingMap;
      renderer.toneMapping = toneMappingMap[value] as ToneMapping;
    },
  };

  Object.entries(handlers).forEach(([id, fn]) => {
    const el = document.getElementById(id);
    if (!el) return;
    const eventName =
      (el as HTMLInputElement).type === "range" ? "input" : "change";
    el.addEventListener(eventName, fn as EventListener);
  });

  Object.entries(countConfigs).forEach(([id, { manager, opts }]) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", (e) => {
      const target = e.target as HTMLInputElement;
      const v = +target.value;
      const span = document.getElementById(`${id}Value`);
      if (span) span.textContent = v.toString();
      if (manager.baseMeshes.length > 0) {
        spawnMeshes({
          baseMeshes: manager.baseMeshes,
          group: manager.group,
          count: v,
          options: opts,
        });
      }
    });
  });
}
