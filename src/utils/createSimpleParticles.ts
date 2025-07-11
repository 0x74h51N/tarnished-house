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
  Vector2,
  Vector3,
} from "three";
import {
  CreateParticlesInterface,
  CreateParticlesReturn,
  ElevationDividers,
} from "types";
import VS from "../shaders/particles/vertex.vert";
import FS from "../shaders/particles/fragment.frag";
import SparkVS from "../shaders/particles/sparks/vertex.vert";
import SparksFS from "../shaders/particles/sparks/fragment.frag";

const defaultTexture = new DataTexture(
  new Uint8Array([255, 255, 255, 255]),
  1,
  1,
  RGBAFormat
);
defaultTexture.needsUpdate = true;

/**
 * Creates a GPU-accelerated particle system.
 *
 * Particles emit around `startPozs`, launch with random velocities,
 * and optionally grow and fade over time. Sparks variant biases
 * upward motion.
 *
 * @param options.parent     - Scene or group to attach particles.
 * @param options.color      - Base particle color.
 * @param options.opacity    - Initial alpha (0–1).
 * @param options.maxCount   - Total particles in system.
 * @param options.spawnRate  - Particles spawned per second.
 * @param options.area       - Horizontal spawn radius (X/Z).
 * @param options.size       - Base visual size of each particle.
 * @param options.startPozs  - [x,y,z] emission center.
 * @param options.textures   - Single or multiple textures for variants.
 * @param options.scaleFactor- Used for point-size pixel scaling.
 * @param options.sizeGrowth - Rate at which size increases with height.
 * @param options.fadeRate   - Rate at which opacity decreases with height.
 * @param options.sparks     - If true, use spark behavior.
 * @param options.damping    - Controls slowdown rate for sparks vertex shader (higher = faster slow).
 * @param elevDivs           - Sparkels velocity calculation, π-divisors, the elevation‐angle range above the XZ plane, picked randomly between min/max.
 * @param speed              - Sparkels velocity start speed.
 * @param stretchFact        - Stretch factor to elongate each spark along its velocity direction.
 *
 * @returns { points, step, updtScreen }
 *   points      - Array of Three.js Points instances.
 *   step(delta) - Call each frame to spawn & advance particles.
 *   updtScreen  - Call on resize to update resolution uniform.
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
  scaleFactor,
  sizeGrowth = 0,
  fadeRate = 0,
  sparks = false,
  damping = 0.5,
  elevDivs = { min: 1, max: 1 },
  speed = 1,
  stretchFact = 1,
}: CreateParticlesInterface): CreateParticlesReturn {
  const textureArray = Array.isArray(textures) ? textures : [textures];

  const numVariants = textureArray.length;

  const position = new Float32Array(maxCount * 3);
  const vel = new Float32Array(maxCount * 3);
  const startTimeArr = new Float32Array(maxCount);
  const sizeArr = new Float32Array(maxCount).fill(size);
  const growthArr = new Float32Array(maxCount).fill(sizeGrowth);
  const fadeArr = new Float32Array(maxCount).fill(fadeRate);
  const anglesArr = new Float32Array(maxCount);
  const colsArr = new Float32Array(maxCount * 4);

  const baseCol = new Color(color || 0xffffff);

  for (let i = 0; i < maxCount; i++) {
    const i3 = i * 3;
    startPos(startPozs, position, i3, area);
    sparks ? sparkVel(vel, i3, elevDivs, speed) : startVel(vel, i3);

    startTimeArr[i] = Math.random() * 0.1;
    anglesArr[i] = Math.random() * Math.PI * 2;

    colUpt(i, colsArr, baseCol, opacity);
  }

  const pointsArr: Points<
    BufferGeometry<NormalBufferAttributes>,
    RawShaderMaterial,
    Object3DEventMap
  >[] = [];

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(position, 3));
  geometry.setAttribute("startTime", new BufferAttribute(startTimeArr, 1));
  geometry.setAttribute("velocity", new BufferAttribute(vel, 3));
  geometry.setAttribute("size", new BufferAttribute(sizeArr, 1));
  geometry.setAttribute("sizeGrowth", new BufferAttribute(growthArr, 1));
  geometry.setAttribute("angle", new BufferAttribute(anglesArr, 1));
  geometry.setAttribute("colour", new BufferAttribute(colsArr, 4));
  geometry.setAttribute("fadeRate", new BufferAttribute(fadeArr, 1));

  //First Spawn of points
  for (let v = 0; v < numVariants; v++) {
    const dTex = textureArray[v] || defaultTexture;

    const material = new RawShaderMaterial({
      uniforms: {
        resolution: {
          value: new Vector2(window.innerWidth, window.innerHeight),
        },
        diffuseTexture: { value: dTex },
        u_time: { value: 0 },
        u_scale: { value: scaleFactor },
        u_damping: { value: damping },
        u_axisRatio: { value: new Vector3(0.67, 1.0, 0.67) },
        u_stretch: { value: stretchFact },
      },
      vertexShader: sparks ? SparkVS : VS,
      fragmentShader: sparks ? SparksFS : FS,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      dithering: true,
      vertexColors: true,
    });

    const points = new Points(geometry, material);
    points.renderOrder = 9;
    parent.add(points);
    pointsArr.push(points);
  }
  let spawnAccumulator = 0,
    nextIndex = 0;

  //Respawn of Points
  function step(delta: number) {
    spawnAccumulator += delta * spawnRate;
    const toSpawn = Math.floor(spawnAccumulator);
    spawnAccumulator -= toSpawn;

    for (let s = 0; s < toSpawn; s++) {
      const i = nextIndex % maxCount;
      const i3 = i * 3;
      startPos(startPozs, position, i3, area);
      sparks ? sparkVel(vel, i3, elevDivs, speed) : startVel(vel, i3);
      startTimeArr[i] = pointsArr[0].material.uniforms.u_time.value;
      nextIndex++;
    }

    pointsArr[0].geometry.attributes.position.needsUpdate = true;
    pointsArr[0].geometry.attributes.velocity.needsUpdate = true;
    pointsArr[0].geometry.attributes.startTime.needsUpdate = true;

    for (const p of pointsArr) {
      p.material.uniforms.u_time.value += delta;
    }
  }

  function updtScreen() {
    for (const p of pointsArr) {
      p.material.uniforms.resolution.value.set(
        window.innerWidth,
        window.innerHeight
      );
    }
  }

  return { points: pointsArr, step, updtScreen };
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

function startVel(v: Float32Array, i3 = 0) {
  v[i3] = (Math.random() - 0.5) * 0.2;
  v[i3 + 1] = Math.random() * 0.5 + 0.2;
  v[i3 + 2] = (Math.random() - 0.5) * 0.2;
}

function sparkVel(
  v: Float32Array,
  i3 = 0,
  elevDivs: ElevationDividers,
  speed: number
) {
  const speedo = Math.random() * 1.0 + speed;
  const minElev = Math.PI / elevDivs.min;
  const maxElev = Math.PI / elevDivs.max;

  const elev = minElev + Math.random() * (maxElev - minElev);

  const azim = Math.random() * Math.PI * 2;

  const cosE = Math.cos(elev),
    sinE = Math.sin(elev);
  v[i3 + 0] = speedo * cosE * Math.cos(azim);
  v[i3 + 1] = speedo * sinE;
  v[i3 + 2] = speedo * cosE * Math.sin(azim);
}

function colUpt(i: number, colsArr: Float32Array, col: Color, opacity: number) {
  const i4 = i * 4;
  colsArr[i4] = col.r;
  colsArr[i4 + 1] = col.g;
  colsArr[i4 + 2] = col.b;
  colsArr[i4 + 3] = opacity;
}
