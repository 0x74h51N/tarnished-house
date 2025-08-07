import {
  AdditiveBlending,
  BoxGeometry,
  ClampToEdgeWrapping,
  Color,
  GLSL3,
  LinearFilter,
  Matrix4,
  Mesh,
  RawShaderMaterial,
  Vector2,
  Vector3,
  Vector3Like,
  Vector4,
  Vector4Like,
} from "three";
import vertex from "./shaders/vertex.vert";
import frag from "./shaders/fragment.frag";
import {
  CreateParticlesReturn,
  FlameParticlesInterface,
  Step,
  UpdateKey,
  UpdateValue,
} from "../types";
import { createGuiUpdater } from "@/utils";

const v4 = (o: Vector4Like) => new Vector4(o.x, o.y, o.z, o.w);

/**
 * Creates a volumetric flame mesh using animated raymarching shaders.
 *
 * @param parent           - The Object3D to attach the flame mesh to.
 * @param textures         - Optional texture for the flame appearance.
 * @param props.startPozs  - Flame position in world space.
 * @param props.size       - Base size of the flame geometry.
 * @param props.speed      - Controls how fast the flame animates.
 * @param props.color      - Base color applied in the shader.
 * @param props.seed       - Random seed for animation offset.
 * @param props.noise      - Noise config for procedural flame shape.
 * @param props.march      - Raymarching config (iterations & step factor).
 * @param props.colorMixStr- How much the final color mixes with base color.
 *
 * @returns { step, updtScreen }
 *   step(delta)      - Call each frame to spawn & advance particles.
 *   updtScreen       - Call on resize to update resolution uniform.
 *   update(params)   - Update particle system parameters in real-time.
 */
export const createFlame = ({
  pixelRatio,
  parent,
  textures,
  props: {
    startPozs,
    size,
    speed: initialSpeed = 1,
    color,
    seed = Math.random() * 19.19,
    noise,
    march,
    colorMixStr,
  },
}: FlameParticlesInterface): CreateParticlesReturn => {
  let speed = initialSpeed;

  const fireTex = textures;

  fireTex!.flipY = false;
  fireTex!.wrapS = fireTex!.wrapT = ClampToEdgeWrapping;
  fireTex!.magFilter = fireTex!.minFilter = LinearFilter;

  const geometry = new BoxGeometry(size, size * 1.45, size);

  const invModelMatrix = new Matrix4();

  const u_radius = size * 0.5;
  const u_height = size;
  const u_bottom = -size * 0.8;

  const uniforms = {
    diffText: { value: fireTex },
    u_time: { value: 0 },
    seed: { value: seed },
    invModelMatrix: { value: invModelMatrix },
    scale: { value: new Vector3(size, size, size) },

    // noise
    noiseScale: { value: v4(noise.noiseScale) },
    magnitude: { value: noise.magnitude },
    lacunarity: { value: noise.lacunarity },
    gain: { value: noise.gain },
    u_octaves: { value: noise.octaves },
    u_iterations: { value: march.iterations },

    // shape
    u_radius: { value: u_radius },
    u_height: { value: u_height },
    u_bottom: { value: u_bottom },

    resolution: {
      value: new Vector2(
        window.innerWidth * pixelRatio,
        window.innerHeight * pixelRatio
      ),
    },
    u_pixelRatio: { value: pixelRatio },
    color: {
      value: new Color(color),
    },
    colorMixStrength: { value: colorMixStr },
  };

  const material = new RawShaderMaterial({
    glslVersion: GLSL3,
    vertexShader: vertex,
    fragmentShader: frag,
    transparent: true,
    depthWrite: false,
    uniforms,
    blending: AdditiveBlending,
  });

  const flame = new Mesh(geometry, material);
  flame.position.set(startPozs.x, startPozs.y, startPozs.z);
  parent.add(flame);

  flame.renderOrder = 3;
  flame.updateMatrixWorld(true);
  uniforms.invModelMatrix.value.copy(flame.matrixWorld).invert();

  //Animation steps
  const step: Step = (delta) => {
    uniforms.u_time.value += delta * speed;
    flame.updateMatrixWorld(true);
    uniforms.invModelMatrix.value.copy(flame.matrixWorld).invert();
  };

  function updtScreen(pr: number) {
    uniforms.resolution.value.set(
      window.innerWidth * pr,
      window.innerHeight * pr
    );
    uniforms.u_pixelRatio.value = pr;
  }

  //
  // ------------------ GUI Updater ------------------
  //
  const guiHandlers: {
    [K in UpdateKey]?: (value: UpdateValue<K>) => void;
  } = {
    size: (v) => {
      uniforms.scale.value.setScalar(v);
      uniforms.u_radius.value = v * 0.6;
      uniforms.u_height.value = v;
      uniforms.u_bottom.value = -v * 0.8;
    },

    speed: (v) => {
      speed = v!;
    },

    color: (v) => {
      uniforms.color.value.set(new Color(v));
    },

    colorMixStr: (v) => {
      uniforms.colorMixStrength.value = v;
    },

    startPozs: (v) => {
      flame.position.set(v.x, v.y, v.z);
    },

    "noise.magnitude": (v) => {
      uniforms.magnitude.value = v;
    },

    "noise.noiseScale": (v) => {
      uniforms.noiseScale.value.set(v.x, v.y, v.z, v.w);
    },

    "noise.lacunarity": (v) => {
      uniforms.lacunarity.value = v;
    },

    "noise.gain": (v) => {
      uniforms.gain.value = v;
    },

    "noise.octaves": (v) => {
      uniforms.u_octaves.value = v;
    },
  };

  const update = createGuiUpdater(guiHandlers);

  return { step, updtScreen, update };
};
