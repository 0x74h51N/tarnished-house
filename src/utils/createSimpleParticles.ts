import {
  DataTexture,
  RGBAFormat,
  Color,
  Points,
  BufferGeometry,
  NormalBufferAttributes,
  Object3DEventMap,
  AdditiveBlending,
  BufferAttribute,
  RawShaderMaterial,
} from "three";
import { CreateParticlesInterface, CreateParticlesReturn } from "types";
import VS from "../shaders/particles/vertex.vert";
import FS from "../shaders/particles/fragment.frag";

const defaultTexture = new DataTexture(
  new Uint8Array([255, 255, 255, 255]),
  1,
  1,
  RGBAFormat
);
defaultTexture.needsUpdate = true;

/**
 * Creates a GPU-accelerated particle system using JS & GLSL.
 * Particles emit around a start position (`startPozs`), move upwards with randomized velocity,
 * and can optionally grow in size or fade in opacity over time. Shaders handle rotation, and blending.
 *
 * @param {Object} options
 * @param {Object3D} options.parent                   – Parent object (scene or group) to attach the particle system.
 * @param {Color|number|string} options.color         – Base color for all particles.
 * @param {number} [options.opacity=1]                – Initial opacity (alpha) of particles (0–1).
 * @param {number} [options.maxCount=200]             – Total number of particles in the system.
 * @param {number} [options.spawnRate=50]             – Number of particles spawned per second.
 * @param {number} [options.area=1]                   – Horizontal spread (X/Z) of particle spawn positions.
 * @param {number} [options.size=0.05]                – Base visual size of each particle.
 * @param {Array<number>} [options.startPozs=[0,0,0]] – Center [x, y, z] of particle emission.
 * @param {Array<Texture>|Texture|null} [options.textures=null] – Optional one or more textures used for particles. If multiple are given, each is used in a variant.
 * @param {Camera} options.camera                     – Camera reference, used for perspective-based scaling.
 * @param {number} [options.sizeGrowth=0]             – Rate at which particle size increases with height (per particle).
 * @param {number} [options.fadeRate=0]               – Rate at which particle opacity decreases with height (per particle).
 *
 * @returns {Object} Particle system object:
 *   - `points`: Array of Three.js `Points` instances.
 *   - `step(delta: number)`: Function to be called every frame to spawn and update particles.
 */

export function createParticles({
  parent,
  color,
  opacity = 1,
  maxCount = 200,
  spawnRate = 50,
  area = 1,
  size = 0.05,
  startPozs = [0, 0, 0],
  textures = [],
  camera,
  sizeGrowth = 0,
  fadeRate = 0,
}: CreateParticlesInterface): CreateParticlesReturn {
  const textureArray = Array.isArray(textures) ? textures : [textures];

  const numVariants = textureArray.length;

  const position = new Float32Array(maxCount * 3);
  const vel = new Float32Array(maxCount * 3);
  const startTimeArr = new Float32Array(maxCount);
  const growthArr = new Float32Array(maxCount).fill(sizeGrowth);

  const anglesArr = new Float32Array(maxCount);
  const colsArr = new Float32Array(maxCount * 4);
  const baseCol = new Color(color || 0xffffff);

  for (let i = 0; i < maxCount; i++) {
    const i3 = i * 3;
    startPos(startPozs, position, i3, area);
    startV(vel, i3, true);

    startTimeArr[i] = Math.random() * 0.1;
    anglesArr[i] = Math.random() * Math.PI * 2;

    colUpt(i, colsArr, baseCol, opacity);
  }

  const pointsArr: Points<
    BufferGeometry<NormalBufferAttributes>,
    RawShaderMaterial,
    Object3DEventMap
  >[] = [];
  let spawnAccumulator = 0,
    nextIndex = 0;

  for (let v = 0; v < numVariants; v++) {
    const dTex = textureArray[v] || defaultTexture;

    const material = new RawShaderMaterial({
      uniforms: {
        pointMultiplier: {
          value: window.innerHeight / Math.tan((camera.fov * Math.PI) / 360),
        },
        diffuseTexture: { value: dTex },
        u_time: { value: 0 },
      },
      vertexShader: VS,
      fragmentShader: FS,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      dithering: true,
      vertexColors: true,
    });

    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(position, 3));
    geometry.setAttribute("startTime", new BufferAttribute(startTimeArr, 1));
    geometry.setAttribute("velocity", new BufferAttribute(vel, 3));
    geometry.setAttribute(
      "size",
      new BufferAttribute(new Float32Array(maxCount).fill(size), 1)
    );
    geometry.setAttribute("sizeGrowth", new BufferAttribute(growthArr, 1));
    geometry.setAttribute("angle", new BufferAttribute(anglesArr, 1));
    geometry.setAttribute("colour", new BufferAttribute(colsArr, 4));
    geometry.setAttribute(
      "fadeRate",
      new BufferAttribute(new Float32Array(maxCount).fill(fadeRate), 1)
    );

    const points = new Points(geometry, material);
    points.renderOrder = 9;
    parent.add(points);
    pointsArr.push(points);
  }

  function step(delta: number) {
    spawnAccumulator += delta * spawnRate;
    const toSpawn = Math.floor(spawnAccumulator);
    spawnAccumulator -= toSpawn;

    for (let s = 0; s < toSpawn; s++) {
      const i = nextIndex % maxCount;
      const i3 = i * 3;

      startPos(startPozs, position, i3, area);
      startV(vel, i3);
      startTimeArr[i] = pointsArr[0].material.uniforms.u_time.value;

      nextIndex++;
    }

    for (const p of pointsArr) {
      p.geometry.attributes.position.needsUpdate = true;
      p.geometry.attributes.velocity.needsUpdate = true;
      p.geometry.attributes.startTime.needsUpdate = true;
      p.material.uniforms.u_time.value += delta;
    }
  }
  return { points: pointsArr, step };
}

function startPos(
  startPozs: number[] = [0, 0, 0],
  pos: Float32Array,
  i3: number = 0,
  area: number
) {
  pos[i3] = startPozs[0] + (Math.random() * 2 - 1) * area;
  pos[i3 + 1] = startPozs[1];
  pos[i3 + 2] = startPozs[2] + (Math.random() * 2 - 1) * area;
}

function startV(v: Float32Array, i3 = 0, f = false) {
  v[i3] = f ? 0 : (Math.random() - 0.5) * 0.2;
  v[i3 + 1] = Math.random() * 0.5 + 0.2;
  v[i3 + 2] = f ? 0 : (Math.random() - 0.5) * 0.2;
}

function colUpt(i: number, colsArr: Float32Array, col: Color, opacity: number) {
  const i4 = i * 4;
  colsArr[i4] = col.r;
  colsArr[i4 + 1] = col.g;
  colsArr[i4 + 2] = col.b;
  colsArr[i4 + 3] = opacity;
}
