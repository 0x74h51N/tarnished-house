export type PerfTier = "patato" | "mid" | false;

export async function detectPerf(): Promise<PerfTier> {
  const canvas = document.createElement("canvas");
  const gl2 = canvas.getContext("webgl2") as WebGL2RenderingContext | null;
  const gl =
    gl2 ||
    (canvas.getContext("webgl") as WebGLRenderingContext | null) ||
    (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);

  if (!gl) return "patato";

  const minSide = Math.min(window.innerWidth, window.innerHeight);
  const isPhoneLike = minSide <= 648;
  const isTabletLike = !isPhoneLike && minSide <= 1024;

  // caps
  const maxTex = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number;
  const maxVertUni = gl2
    ? (gl2.getParameter(gl2.MAX_VERTEX_UNIFORM_COMPONENTS) as number) / 4
    : (gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS) as number);

  // renderer
  const dbg = gl.getExtension("WEBGL_debug_renderer_info");
  const rendererStr =
    dbg && gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)
      ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)).toLowerCase()
      : "";

  const isMobileGPU = /(mali|adreno)/i.test(rendererStr);
  const isIntelIntegratedMid = /intel.*\b(iris\s?xe|uhd|hd\s?graphics)\b/i.test(
    rendererStr
  );
  const isSwiftShader = /swiftshader/i.test(rendererStr);
  const isDiscreteDesktop = /(nvidia|geforce|rtx|radeon|amd)/i.test(
    rendererStr
  );

  // ----- patato -----
  const isLowTex = maxTex <= 2048;
  const isLowVertUni = maxVertUni < 256;
  if (
    isPhoneLike ||
    isSwiftShader ||
    isLowTex ||
    (isLowVertUni && !isDiscreteDesktop)
  ) {
    return "patato";
  }

  // ----- mid -----
  const midTex = maxTex <= 4096;
  const midVertUni = maxVertUni <= 256 && !isMobileGPU && !isSwiftShader;
  const midVendor = isIntelIntegratedMid || isMobileGPU;

  const midVotes =
    (isTabletLike ? 1 : 0) +
    (midTex ? 1 : 0) +
    (midVertUni && !isDiscreteDesktop ? 1 : 0) +
    (midVendor ? 1 : 0);

  return midVotes >= 2 ? "mid" : false;
}
