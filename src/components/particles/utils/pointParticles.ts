import {
  DataTexture,
  RGBAFormat,
  Color,
  Points,
  BufferGeometry,
  AdditiveBlending,
  BufferAttribute,
  RawShaderMaterial,
  Vector2,
  Vector3,
  GLSL3,
} from "three";
import {
  CreateParticlesReturn,
  ElevationDividers,
  PointParticlesInterface,
  Step,
  UpdateFn,
} from "../types";
import VS from "../shaders/pointParticle/vertex.vert";
import FS from "../shaders/pointParticle/fragment.frag";
import SparkVS from "../shaders/sparks/vertex.vert";
import SparksFS from "../shaders/sparks/fragment.frag";

const defaultTexture = new DataTexture(
  new Uint8Array([255, 255, 255, 255]),
  1,
  1,
  RGBAFormat
);
/**
 * Creates a particle system using Points geometry with custom shaders.
 *
 * @param parent      - The parent Object3D to attach particles to.
 * @param color       - Base color for all particles.
 * @param opacity     - Base opacity for all particles.
 * @param maxCount    - Maximum number of particles in the system.
 * @param spawnRate   - Rate at which new particles are spawned (per second).
 * @param area        - Spawn area radius around the start position.
 * @param size        - Base size of each particle.
 * @param startPozs   - Initial spawn position for particles.
 * @param textures    - Texture(s) to use for particles. Can be array for variants.
 * @param scaleFactor - Scale multiplier for particle sizes.
 * @param sizeGrowth  - Rate at which particles grow over time.
 * @param fadeRate    - Rate at which particles fade out.
 * @param sparks      - Whether to use spark mode (different physics/rendering).
 * @param damping     - Velocity damping factor (higher = more resistance).
 * @param elevDivs    - Elevation angle divisions for spark direction (min/max).
 * @param speed       - Base speed multiplier for particle movement.
 * @param stretchFact - Stretch factor for spark particles.
 *
 * @returns { step, updtScreen, update }
 *   step(delta)    - Call each frame to spawn & advance particles.
 *   updtScreen     - Call on resize to update resolution uniform.
 *   update(params) - Update particle system parameters in real-time.
 */
export function createParticles({
  parent,
  color,
  opacity = 1,
  maxCount = 200,
  spawnRate = 50,
  area = 1,
  size = 0.05,
  startPozs,
  textures = [],
  scaleFactor,
  sizeGrowth = 0,
  fadeRate = 0,
  sparks = false,
  damping = 0.5,
  elevDivs = { min: 1, max: 1 },
  speed = 1,
  stretchFact = 1,
}: PointParticlesInterface): CreateParticlesReturn {
  const state = {
    spawnRate,
    area,
    speed,
    elevDivs: { ...elevDivs },
    size,
    sizeGrowth,
    fadeRate,
    opacity,
    color: new Color(color || 0xffffff),
  };

  const textureArray = Array.isArray(textures) ? textures : [textures];
  const numVariants = textureArray.length;

  // ------------------ BUFFERS ------------------
  const position = new Float32Array(maxCount * 3);
  const vel = new Float32Array(maxCount * 3);
  const startTimeArr = new Float32Array(maxCount);
  const sizeArr = new Float32Array(maxCount).fill(state.size);
  const growthArr = new Float32Array(maxCount).fill(state.sizeGrowth);
  const fadeArr = new Float32Array(maxCount).fill(state.fadeRate);
  const anglesArr = new Float32Array(maxCount);
  const colsArr = new Float32Array(maxCount * 4); // r g b a

  for (let i = 0; i < maxCount; i++) {
    const i3 = i * 3;
    startPos(startPozs, position, i3, state.area);
    sparks ? sparkVel(vel, i3, state.elevDivs, state.speed) : startVel(vel, i3);
    startTimeArr[i] = Math.random() * 0.1;
    anglesArr[i] = Math.random() * Math.PI * 2;
    colUpt(i, colsArr, state.color, state.opacity);
  }

  // ------------------ GEOMETRY ------------------
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(position, 3));
  geometry.setAttribute("velocity", new BufferAttribute(vel, 3));
  geometry.setAttribute("startTime", new BufferAttribute(startTimeArr, 1));
  geometry.setAttribute("size", new BufferAttribute(sizeArr, 1));
  geometry.setAttribute("sizeGrowth", new BufferAttribute(growthArr, 1));
  geometry.setAttribute("fadeRate", new BufferAttribute(fadeArr, 1));
  geometry.setAttribute("angle", new BufferAttribute(anglesArr, 1));
  geometry.setAttribute("colour", new BufferAttribute(colsArr, 4));

  const POS_VEL_TIME_KEYS = ["position", "velocity", "startTime"];

  // --------------- Common Uniforms ----------------
  const cUniforms = {
    resolution: { value: new Vector2(window.innerWidth, window.innerHeight) },
    u_time: { value: 0 },
    u_scale: { value: scaleFactor },
    u_damping: { value: damping },
    u_axisRatio: { value: new Vector3(0.67, 1.0, 0.67) },
    u_stretch: { value: stretchFact },
  };

  const pointsArr: Points[] = [];

  //
  // ------------------ Initial Spawn ------------------
  //
  for (let i = 0; i < numVariants; i++) {
    const dTex = textureArray[i] ?? textureArray[0];
    const uniforms = {
      ...cUniforms,
      diffuseTexture: { value: dTex },
    };

    const material = new RawShaderMaterial({
      glslVersion: GLSL3,
      uniforms,
      vertexShader: sparks ? SparkVS : VS,
      fragmentShader: sparks ? SparksFS : FS,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      dithering: true,
      vertexColors: true,
    });

    const pts = new Points(geometry, material);
    pts.renderOrder = 4;
    parent.add(pts);
    pointsArr.push(pts);
  }

  const mainGeo = geometry;

  //
  // ------------------ Animation ------------------
  //
  let spawnAccumulator = 0;
  let nextIndex = 0;

  const step: Step = (delta) => {
    spawnAccumulator += delta * state.spawnRate;
    const toSpawn = Math.floor(spawnAccumulator);
    spawnAccumulator -= toSpawn;

    //re-spawn point and update attributes if it needed
    if (toSpawn > 0) {
      for (let s = 0; s < toSpawn; s++) {
        const i = nextIndex % maxCount;
        const i3 = i * 3;
        startPos(startPozs, position, i3, state.area);
        (sparks ? sparkVel : startVel)(vel, i3, state.elevDivs, state.speed);
        startTimeArr[i] = cUniforms.u_time.value;
        nextIndex++;
      }
      markAttrFlags(mainGeo, POS_VEL_TIME_KEYS);
    }

    cUniforms.u_time.value += delta;
  };

  function updtScreen() {
    cUniforms.resolution.value.set(window.innerWidth, window.innerHeight);
  }

  //
  // ------------------ GUI Updater ------------------
  //
  const update: UpdateFn = (key, value) => {
    switch (key) {
      case "spawnRate":
        state.spawnRate = value as number;
        break;
      case "area":
        state.area = value as number;
        break;
      case "speed":
        state.speed = value as number;
        break;
      case "elevDivs": {
        const v = value as ElevationDividers;
        state.elevDivs = { ...v };
        break;
      }
      // --- ATTRIBUTES (CPU + flag) ---
      case "size": {
        const v = value as number;
        state.size = v;
        sizeArr.fill(v);
        markAttrFlags(mainGeo, ["size"]);
        break;
      }
      case "sizeGrowth": {
        const v = value as number;
        state.sizeGrowth = v;
        growthArr.fill(v);
        markAttrFlags(mainGeo, ["sizeGrowth"]);
        break;
      }
      case "fadeRate": {
        const v = value as number;
        state.fadeRate = v;
        fadeArr.fill(v);
        markAttrFlags(mainGeo, ["fadeRate"]);
        break;
      }
      case "opacity": {
        const v = value as number;
        state.opacity = v;
        for (let i = 0; i < maxCount; i++) colsArr[i * 4 + 3] = v;
        markAttrFlags(mainGeo, ["colour"]);
        break;
      }
      case "color": {
        const c = new Color(value as any);
        state.color.copy(c);
        for (let i = 0; i < maxCount; i++) {
          const i4 = i * 4;
          colsArr[i4] = c.r;
          colsArr[i4 + 1] = c.g;
          colsArr[i4 + 2] = c.b;
        }
        markAttrFlags(mainGeo, ["colour"]);
        break;
      }
      // --- UNIFORMS ---
      case "scaleFactor":
        cUniforms.u_scale.value = value as number;
        break;
      case "damping":
        cUniforms.u_damping.value = value as number;
        break;
      case "stretchFact":
        cUniforms.u_stretch.value = value as number;
        break;
      default:
        break;
    }
  };

  return { step, updtScreen, update };
}

//Constructional Helpers

type GeometryAttributes = BufferGeometry["attributes"];
type AttributeKey = Extract<keyof GeometryAttributes, string>;

export function markAttrFlags(
  geo: BufferGeometry,
  names: AttributeKey[]
): void {
  const attrs = geo.attributes as GeometryAttributes;
  for (let i = 0; i < names.length; i++) {
    const attr = attrs[names[i]];
    if (attr) attr.needsUpdate = true;
  }
}

//Calculational helpers
function startPos(
  startPozs: { x: number; y: number; z: number },
  pos: Float32Array,
  i3: number = 0,
  area: number
) {
  pos[i3] = startPozs.x + (Math.random() * 2 - 1) * area;
  pos[i3 + 1] = startPozs.y;
  pos[i3 + 2] = startPozs.z + (Math.random() * 2 - 1) * area;
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
