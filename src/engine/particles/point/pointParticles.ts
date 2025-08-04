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
  PointParticlesInterface,
  Step,
  UpdateKey,
  UpdateValue,
} from "../types";
import VS from "./shaders/vertex.vert";
import FS from "./shaders/fragment.frag";
import SparkVS from "./shaders/sparks/vertex.vert";
import SparksFS from "./shaders/sparks/fragment.frag";
import { startPos, sparkVel, startVel, colUpt, markAttrFlags } from "./utils";
import { createGuiUpdater } from "@/utils";

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
 * @param props.sparkProps
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
    size,
    sizeGrowth = 0,
    fadeRate = 0,
    opacity = 1,
    color,
    maxCount,
    startPozs,
    scaleFactor,
    sparkProps,
  },
}: PointParticlesInterface): CreateParticlesReturn {
  const clr = new Color(color);
  let { damping, stretchFact, elevDivs } = sparkProps ?? {};

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

    if (sparkProps && sparkProps.elevDivs) {
      sparkVel(vel, i3, sparkProps.elevDivs, speed);
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
    const isSpark = !!(sparkProps && sparkProps.elevDivs);
    const material = new RawShaderMaterial({
      glslVersion: GLSL3,
      uniforms,
      vertexShader: isSpark ? SparkVS : VS,
      fragmentShader: isSpark ? SparksFS : FS,
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
        if (sparkProps && elevDivs) sparkVel(vel, i3, elevDivs, speed);
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
  const guiHandlers: {
    [K in UpdateKey]?: (value: UpdateValue<K>) => void;
  } = {
    spawnRate: (v) => {
      spawnRate = v;
    },

    area: (v) => {
      area = v;
    },

    speed: (v) => {
      speed = v!;
    },

    "sparkProps.elevDivs": (v) => {
      elevDivs = { ...v };
    },

    // --- ATTRIBUTES (CPU + flag) ---
    size: (v) => {
      size = v;
      sizeArr.fill(v);
      markAttrFlags(mainGeo, ["size"]);
    },

    sizeGrowth: (v) => {
      sizeGrowth = v!;
      growthArr.fill(v!);
      markAttrFlags(mainGeo, ["sizeGrowth"]);
    },

    fadeRate: (v) => {
      fadeRate = v!;
      fadeArr.fill(v!);
      markAttrFlags(mainGeo, ["fadeRate"]);
    },

    opacity: (v) => {
      opacity = v!;
      for (let i = 0; i < maxCount; i++) colsArr[i * 4 + 3] = v!;
      markAttrFlags(mainGeo, ["colour"]);
    },

    color: (v) => {
      const c = new Color(v);
      clr.copy(c);
      for (let i = 0; i < maxCount; i++) {
        const i4 = i * 4;
        colsArr[i4] = c.r;
        colsArr[i4 + 1] = c.g;
        colsArr[i4 + 2] = c.b;
      }
      markAttrFlags(mainGeo, ["colour"]);
    },

    // --- UNIFORMS ---
    scaleFactor: (v) => {
      cUniforms.u_scale.value = v;
    },

    "sparkProps.damping": (v) => {
      cUniforms.u_damping.value = v;
    },

    "sparkProps.stretchFact": (v) => {
      cUniforms.u_stretch.value = v;
    },
  };

  const update = createGuiUpdater(guiHandlers);

  return { step, updtScreen, update };
}
