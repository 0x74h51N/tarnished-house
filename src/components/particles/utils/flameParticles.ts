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
  Texture,
  Vector2,
  Vector3,
  Vector3Like,
  Vector4,
  Vector4Like,
} from "three";
import vertex from "../shaders/flame/vertex.vert";
import frag from "../shaders/flame/fragment.frag";
import {
  CreateParticlesReturn,
  FlameParticlesInterface,
  NoiseParams,
  Step,
  UpdateFn,
} from "../types";

const v4 = (o: Vector4Like) => new Vector4(o.x, o.y, o.z, o.w);

/**
 * Creates a volumetric flame mesh with animated fire shader.
 *
 * @param parent      - The parent Object3D to attach the flame mesh to.
 * @param textures    - Flame texture.
 * @param startPozs   - Initial position of the flame in world space.
 * @param size        - Base size of the flame (affects geometry and scale).
 * @param speed       - Time progression multiplier (affects animation speed).
 * @param color       - Base color of the flame (optional use in fragment shader).
 * @param seed        - Random seed for animation offset.
 * @param noise       - Noise config used inside shader (scale, gain, lacunarity...).
 * @param march       - Raymarching config (step count, ray step factor).
 *
 * @returns { step, updtScreen }
 *   step(delta)      - Call each frame to spawn & advance particles.
 *   updtScreen       - Call on resize to update resolution uniform.
 *   update(params)   - Update particle system parameters in real-time.
 */
export const createFlame = ({
  parent,
  textures,
  startPozs,
  size,
  speed: initialSpeed,
  color,
  seed = Math.random() * 19.19,
  noise,
  march,
  colorMixStr,
}: FlameParticlesInterface): CreateParticlesReturn => {
  let speed = initialSpeed;
  const fireTex = textures as Texture;
  fireTex.flipY = false;
  fireTex.wrapS = fireTex.wrapT = ClampToEdgeWrapping;
  fireTex.magFilter = fireTex.minFilter = LinearFilter;

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

    resolution: { value: new Vector2(window.innerWidth, window.innerHeight) },
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

  function updtScreen() {
    uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
  }

  //Gui updts
  const update: UpdateFn = (key, value) => {
    switch (key) {
      // ---------- scalar / simple ----------
      case "size": {
        const s = value as number;
        uniforms.scale.value.setScalar(s);
        uniforms.u_radius.value = s * 0.6;
        uniforms.u_height.value = s;
        uniforms.u_bottom.value = -s * 0.8;
        break;
      }
      case "speed":
        speed = value as number;
        break;

      case "color":
        uniforms.color.value.set(new Color(value as string));
        break;
      case "colorMixStr":
        uniforms.colorMixStrength.value = value as number;
        break;
      case "startPozs": {
        const p = value as Vector3Like;
        flame.position.set(p.x, p.y, p.z);
        break;
      }

      // ---------- nested objects ----------
      case "noise": {
        const n = value as NoiseParams;
        if (n.noiseScale) {
          const ns = n.noiseScale;
          uniforms.noiseScale.value.set(ns.x, ns.y, ns.z, ns.w);
        }
        if (n.magnitude !== undefined) uniforms.magnitude.value = n.magnitude;
        if (n.lacunarity !== undefined)
          uniforms.lacunarity.value = n.lacunarity;
        if (n.gain !== undefined) uniforms.gain.value = n.gain;
        if (n.octaves !== undefined) uniforms.u_octaves.value = n.octaves;
        break;
      }

      default:
        break;
    }
  };

  return { step, updtScreen, update };
};
