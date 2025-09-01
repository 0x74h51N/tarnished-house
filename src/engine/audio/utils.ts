import type { AudioLoader } from "three";

const bufferCache = new Map<string, AudioBuffer>();
export const loadBuffer = async (url: string, loader: AudioLoader) => {
  const cached = bufferCache.get(url);
  if (cached) return cached;
  const buf = await loader.loadAsync(url);
  bufferCache.set(url, buf);
  return buf;
};
