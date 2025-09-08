import type { WebGLRenderer } from "three";
import type { EffectComposer } from "three/examples/jsm/Addons.js";
import { byId } from "../utils";
import "./styles.css";

interface ScreenshotOptions {
  renderer: WebGLRenderer;
  composer: EffectComposer;
}

export function initScreenshotButton({
  renderer,
  composer
}: ScreenshotOptions) {
  const btn = byId("photo-shot");
  const canvas = renderer.domElement;
  const FPS = 60;
  const MBPS = 12_000_000;

  let recorder: MediaRecorder | null = null;
  let stream: MediaStream | null = null;
  let chunks: BlobPart[] = [];
  let recording = false;
  let currentExt = "webm";

  // REC badge
  const rec = document.createElement("div");
  rec.className = "rec-indicator";
  rec.innerHTML = `<span class="dot"></span><span>REC</span>`;
  document.body.appendChild(rec);
  const showREC = (v: boolean) => rec.classList.toggle("show", v);

  const ts = () => {
    const d = new Date();
    const p = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}-${p(d.getMinutes())}-${p(d.getSeconds())}`;
  };

  const download = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  function pickMime(): { type: string; ext: "webm" | "mp4" } {
    const prefs = [
      { type: "video/webm;codecs=vp9,opus", ext: "webm" as const },
      { type: "video/webm;codecs=vp8,opus", ext: "webm" as const },
      { type: "video/webm", ext: "webm" as const },
      { type: "video/mp4;codecs=h264,aac", ext: "mp4" as const },
      { type: "video/mp4", ext: "mp4" as const }
    ];
    for (const p of prefs) {
      if (window.MediaRecorder?.isTypeSupported?.(p.type)) return p;
    }
    return { type: "", ext: "webm" };
  }

  function startRecording() {
    if (recording) return;

    const { type: mimeType, ext } = pickMime();
    currentExt = ext;

    stream = canvas.captureStream(FPS);

    const opts: MediaRecorderOptions = {};
    if (mimeType) opts.mimeType = mimeType;
    opts.videoBitsPerSecond = MBPS;

    recorder = new MediaRecorder(stream, opts);
    chunks = [];

    recorder.ondataavailable = (e) => {
      if (e.data?.size) chunks.push(e.data);
    };

    recorder.onstop = () => {
      const type = recorder?.mimeType || mimeType || "video/webm";
      const blob = new Blob(chunks, { type });
      chunks = [];
      download(blob, `capture_${ts()}.${currentExt}`);
    };

    recorder.start();
    recording = true;
    showREC(true);
  }

  function stopRecording() {
    if (!recording || !recorder) return;

    try {
      if (recorder.state !== "inactive") recorder.stop();
    } catch {}

    if (stream) {
      for (const t of stream.getTracks()) t.stop();
    }

    stream = null;
    recorder = null;
    recording = false;
    showREC(false);
  }

  btn.addEventListener("click", (ev: MouseEvent) => {
    if (recording) {
      ev.preventDefault();
      stopRecording();
      return;
    }
    if (ev.ctrlKey) {
      ev.preventDefault();
      startRecording();
      return;
    }
    composer.render();
    requestAnimationFrame(() => {
      canvas.toBlob(
        (blob) => blob && download(blob, `screenshot_${ts()}.png`),
        "image/png"
      );
    });
  });

  window.addEventListener("keydown", (e: KeyboardEvent) => {
    if (!recording) return;
    const isCtrlDot =
      e.ctrlKey && (e.key === "." || e.code === "Period" || e.key === ">");
    if (isCtrlDot) {
      e.preventDefault();
      stopRecording();
    }
  });
}
