import type { Scene, WebGLRenderer } from "three";
declare global {
  interface Window {
    __SCENE__?: Scene;
    __RENDERER__?: WebGLRenderer;
  }
}
