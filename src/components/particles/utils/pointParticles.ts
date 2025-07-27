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
 * Creates a GPU particle system using custom shaders and buffer attributes.
 *
 * @param parent   - The Object3D to attach the particle system to.
 * @param textures - Optional texture(s) for the particles (single or multiple variants).
 * @param props.spawnRate   - How many particles spawn per second.
 * @param props.area        - Radius around the start position where particles spawn.
 * @param props.speed       - Base velocity multiplier for particles.
 * @param props.elevDivs    - Elevation range for spark direction (used only if sparks is true).
 * @param props.size        - Initial size of each particle.
 * @param props.sizeGrowth  - Growth rate for particle size over time.
 * @param props.fadeRate    - How quickly particles fade out (opacity drop).
 * @param props.opacity     - Starting opacity of all particles.
 * @param props.color       - Starting color of all particles (Color, hex, or string).
 * @param props.maxCount    - Maximum number of particles active at once.
 * @param props.startPozs   - Center position where particles are spawned around.
 * @param props.sparks      - Enables spark mode (directional & fast-moving particles).
 * @param props.damping     - Velocity damping (resistance during motion).
 * @param props.scaleFactor - Uniform scale multiplier for all particles.
 * @param props.stretchFact - How much particles stretch based on velocity (spark only).
 *
 * @returns { step, updtScreen, update }
 *   step(delta)    - Call each frame to spawn & advance particles.
 *   updtScreen     - Call on resize to update resolution uniform.
 *   update(params) - Update particle system parameters in real-time.
 */

export function createPointParticles({
  parent,
  textures,
  props: {
    spawnRate,
    area,
    speed = 1,
    elevDivs,
    size,
    sizeGrowth = 0,
    fadeRate = 0,
    opacity = 1,
    color,
    maxCount,
    startPozs,
    sparks = false,
    damping = 1,
    scaleFactor = 1,
    stretchFact = 1,
  },
}: PointParticlesInterface): CreateParticlesReturn {
  const clr = new Color(color);

  const textureArray = Array.isArray(textures)
    ? textures.map((t) => t ?? defaultTexture)
    : [textures ?? defaultTexture];
  const numVariants = textureArray.length;

  // ------------------ BUFFERS ------------------
  const position = new Float32Array(maxCount * 3);
  const vel = new Float32Array(maxCount * 3);
  const startTime = new Float32Array(maxCount);
  const sizeArr = new Float32Array(maxCount).fill(size);
  const growthArr = new Float32Array(maxCount).fill(sizeGrowth);
  const fadeArr = new Float32Array(maxCount).fill(fadeRate);
  const anglesArr = new Float32Array(maxCount);
  const colsArr = new Float32Array(maxCount * 4);

  for (let i = 0; i < maxCount; i++) {
    const i3 = i * 3;
    startPos(startPozs, position, i3, area);

    if (sparks && elevDivs) {
      sparkVel(vel, i3, elevDivs, speed);
    } else {
      startVel(vel, i3);
    }

    startTime[i] = Math.random() * 0.1;
    anglesArr[i] = Math.random() * Math.PI * 2;
    colUpt(i, colsArr, clr, opacity);
  }

  // ------------------ GEOMETRY ------------------
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(position, 3));
  geometry.setAttribute("velocity", new BufferAttribute(vel, 3));
  geometry.setAttribute("startTime", new BufferAttribute(startTime, 1));
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
    spawnAccumulator += delta * spawnRate;
    const toSpawn = Math.floor(spawnAccumulator);
    spawnAccumulator -= toSpawn;

    //re-spawn point and update attributes if it needed
    if (toSpawn > 0) {
      for (let s = 0; s < toSpawn; s++) {
        const i = nextIndex % maxCount;
        const i3 = i * 3;
        startPos(startPozs, position, i3, area);
        if (sparks && elevDivs) sparkVel(vel, i3, elevDivs, speed);
        else startVel(vel, i3);
        startTime[i] = cUniforms.u_time.value;
        nextIndex++;
      }
      markAttrFlags(geometry, POS_VEL_TIME_KEYS);
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
        spawnRate = value as number;
        break;
      case "area":
        area = value as number;
        break;
      case "speed":
        speed = value as number;
        break;
      case "elevDivs": {
        const v = value as ElevationDividers;
        elevDivs = { ...v };
        break;
      }
      // --- ATTRIBUTES (CPU + flag) ---
      case "size": {
        const v = value as number;
        size = v;
        sizeArr.fill(v);
        markAttrFlags(mainGeo, ["size"]);
        break;
      }
      case "sizeGrowth": {
        const v = value as number;
        sizeGrowth = v;
        growthArr.fill(v);
        markAttrFlags(mainGeo, ["sizeGrowth"]);
        break;
      }
      case "fadeRate": {
        const v = value as number;
        fadeRate = v;
        fadeArr.fill(v);
        markAttrFlags(mainGeo, ["fadeRate"]);
        break;
      }
      case "opacity": {
        const v = value as number;
        opacity = v;
        for (let i = 0; i < maxCount; i++) colsArr[i * 4 + 3] = v;
        markAttrFlags(mainGeo, ["colour"]);
        break;
      }
      case "color": {
        const c = new Color(value as any);
        clr.copy(c);
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
