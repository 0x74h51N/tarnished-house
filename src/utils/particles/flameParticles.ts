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
  Vector4,
  Vector4Like,
} from "three";
import vertex from "./shaders/flame/vertex.vert";
import frag from "./shaders/flame/fragment.frag";
import { CreateParticlesReturn, FlameParticlesInterface, Steps } from "types";

const v4 = (o: Vector4Like) => new Vector4(o.x, o.y, o.z, o.w);

/**
 * Creates a volumetric flame mesh with animated fire shader.
 *
 * @param parent - The parent Object3D to attach the flame mesh to.
 * @param textures - Flame texture.
 * @param startPozs - Initial position of the flame in world space.
 * @param size - Base size of the flame (affects geometry and scale).
 * @param speed - Time progression multiplier (affects animation speed).
 * @param color - Base color of the flame (optional use in fragment shader).
 * @param seed - Random seed for animation offset.
 * @param noise - Noise config used inside shader (scale, gain, lacunarity...).
 * @param march - Raymarching config (step count, ray step factor).
 *
 * @returns { step, updtScreen }
 *   step(delta) - Call each frame to spawn & advance particles.
 *   updtScreen  - Call on resize to update resolution uniform.
 */
export const createFlame = ({
  parent,
  textures,
  startPozs,
  size,
  speed,
  color,
  seed = Math.random() * 19.19,
  noise,
  march,
}: FlameParticlesInterface): CreateParticlesReturn => {
  const fireTex = textures as Texture;
  fireTex.flipY = false;
  fireTex.wrapS = fireTex.wrapT = ClampToEdgeWrapping;
  fireTex.magFilter = fireTex.minFilter = LinearFilter;

  const geometry = new BoxGeometry(size, size * 1.5, size);

  const invModelMatrix = new Matrix4();

  const u_radius = size * 0.6;
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

    // march
    u_iterations: { value: march.iterations },
    u_rayStep: { value: march.rayStepFactor },

    // shape
    u_radius: { value: u_radius },
    u_height: { value: u_height },
    u_bottom: { value: u_bottom },

    resolution: { value: new Vector2(window.innerWidth, window.innerHeight) },
    color: {
      value: new Color(color),
    },
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

  function step({ delta }: Steps) {
    uniforms.u_time.value += delta * speed;
    flame.updateMatrixWorld(true);
    uniforms.invModelMatrix.value.copy(flame.matrixWorld).invert();
  }

  function updtScreen() {
    uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
  }

  return { step, updtScreen };
};
