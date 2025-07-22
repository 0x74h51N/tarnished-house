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
      //bu henüz fragment'de kullanılmıyor
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
