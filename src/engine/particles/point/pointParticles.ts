// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * pointParticles.ts
 *
 * GPU-driven point particle system for textured (smoke) or spark effects.
 * Implements pooled buffer geometry with per-particle attributes and
 * dynamic behaviors (damping, stretching, and wave motion) via custom shaders.
 *
 * Copyright (C) 2025 Tahsin Önemli
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import {
  DataTexture,
  RGBAFormat,
  Color,
  Points,
  BufferGeometry,
  AdditiveBlending,
  BufferAttribute,
  Vector2,
  Vector3,
  GLSL3,
  ShaderMaterial,
  Group,
  TextureLoader,
  Texture,
} from "three";
import {
  PointUpdateKey,
  PointUpdateValue,
  PointParticles,
  SmokeOpts,
  PointParticleInterface,
  SparkOpts,
  isSmoke,
  isSpark,
} from "./types";
import VS from "./shaders/vertex.vert";
import FS from "./shaders/fragment.frag";
import SparkVS from "./shaders/sparks/vertex.vert";
import SparksFS from "./shaders/sparks/fragment.frag";
import { startPos, sparkVel, startVel, colUpt, markAttrFlags } from "./utils";
import { createGuiUpdater } from "@/utils";
import { Step } from "../types";

const defaultTexture = new DataTexture(
  new Uint8Array([255, 255, 255, 255]),
  1,
  1,
  RGBAFormat
);
/**
 * Creates a GPU particle system using custom shaders and buffer attributes.
 *
 * @param textures - Optional texture(s) for the particles (single or multiple variants).
 * @param props.spawnRate   - How many particles spawn per second.
 * @param props.area        - Radius around the start position where particles spawn.
 * @param props.elevDivs    - Elevation range for spark direction (used only if sparks is true).
 * @param props.size        - Initial size of each particle.
 * @param props.sizeGrowth  - Growth rate for particle size over time.
 * @param props.fadeRate    - How quickly particles fade out (opacity drop).
 * @param props.opacity     - Starting opacity of all particles.
 * @param props.color       - Starting color of all particles (Color, hex, or string).
 * @param props.maxCount    - Maximum number of particles active at once.
 * @param props.startPozs   - Center position where particles are spawned around.
 * @param props.sparkProps  - Spark options
 * @param props.uTimeMult   - Time uniform multiplier, instance speed
 * @param props.sparkProps.damping       - Velocity damping (resistance during motion).
 * @param props.sparkProps.scaleFactor   - Uniform scale multiplier for all particles.
 * @param props.sparkProps.stretchFact   - How much particles stretch based on velocity (spark only).
 * @param props.sparkProps.speed         - Base velocity multiplier for spark particles.
 *
 *
 * @returns { step, updtScreen, update }
 *   points         - Group<Object3DEventMap>
 *   step(delta)    - Call each frame to spawn & advance particles.
 *   updtScreen     - Call on resize to update resolution uniform.
 *   update(params) - Update particle system parameters in real-time.
 */
export function createPointParticles(
  args: PointParticleInterface<SmokeOpts>
): PointParticles;
export function createPointParticles(
  args: PointParticleInterface<SparkOpts>
): PointParticles;

export function createPointParticles(
  args: PointParticleInterface<SparkOpts | SmokeOpts>
): PointParticles {
  const { sizes, props } = args;
  let {
    spawnRate,
    area,
    size,
    sizeGrowth = 0,
    fadeRate = 0,
    color,
    maxCount,
    startPozs,
    scaleFactor,
    uTimeMult = 1,
  } = props;
  const loader = new TextureLoader();

  let opacity = isSmoke(props) ? props.opacity : 1;

  const sparkProps = isSpark(props) ? props.sparkProps : undefined;

  const clr = new Color(color);

  const smokeTexPaths = isSmoke(props) ? props.textures : undefined;

  const textureArray: Texture[] = smokeTexPaths
    ? Array.isArray(smokeTexPaths)
      ? smokeTexPaths.map((p) => loader.load(p))
      : [loader.load(smokeTexPaths)]
    : [];

  const isSparkV = sparkProps && sparkProps.elevDivs && sparkProps.speed;
  const numVariants = isSparkV ? 1 : Math.max(textureArray.length, 1);

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

    if (sparkProps) {
      sparkVel(vel, i3, sparkProps.elevDivs, sparkProps.speed);
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
  const resolution = new Vector2(
    sizes.width * sizes.pixelRatio,
    sizes.height * sizes.pixelRatio
  );

  const cUniforms = {
    resolution: { value: resolution },
    u_time: { value: 0 },
    u_scale: { value: scaleFactor },
  };

  // -------------- Spark Uniforms -------------------
  let { damping, stretchFact, elevDivs, waveFreq, waveAmp, speed } =
    sparkProps ?? {};

  const sUniforms = sparkProps && {
    u_damping: { value: damping },
    u_stretch: { value: stretchFact },
    u_axisRatio: { value: new Vector3(0.67, 1.0, 0.67) },
    u_wave_freq: { value: waveFreq },
    u_wave_amp: { value: waveAmp },
  };

  const points = new Group();
  //
  // ------------------ Initial Spawn ------------------
  //
  for (let i = 0; i < numVariants; i++) {
    const dTex = textureArray[i] ?? textureArray[0];
    const uniforms = {
      ...sUniforms,
      ...cUniforms,
      diffuseTexture: { value: dTex },
    };

    if (!isSparkV) {
      const dTex = textureArray[i] || textureArray[0] || defaultTexture;
      uniforms.diffuseTexture = { value: dTex };
    }

    const material = new ShaderMaterial({
      glslVersion: GLSL3,
      uniforms,
      vertexShader: isSparkV ? SparkVS : VS,
      fragmentShader: isSparkV ? SparksFS : FS,
      toneMapped: false,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      dithering: true,
      vertexColors: true,
    });

    const pts = new Points(geometry, material);
    pts.renderOrder = 4;
    points.add(pts);
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

        if (isSparkV) sparkVel(vel, i3, elevDivs!, speed!);
        else startVel(vel, i3);

        startTime[i] = cUniforms.u_time.value;
        nextIndex++;
      }
      markAttrFlags(geometry, POS_VEL_TIME_KEYS);
    }
    cUniforms.u_time.value += delta * uTimeMult;
  };

  function updtScreen(pr: number) {
    resolution.set(window.innerWidth * pr, window.innerHeight * pr);
  }

  //
  // ------------------ GUI Updater ------------------
  //
  const guiHandlers: {
    [K in PointUpdateKey | any]: (value: PointUpdateValue<K | any>) => void;
  } = {
    reset: () => {
      nextIndex = 0;
      spawnAccumulator = maxCount;
    },

    spawnRate: (v) => {
      spawnRate = v;
    },

    area: (v) => {
      area = v;
    },

    uTimeMult: (v) => {
      uTimeMult = v!;
    },

    "sparkProps.speed": (v) => {
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
      sUniforms!.u_damping.value = v;
    },

    "sparkProps.stretchFact": (v) => {
      sUniforms!.u_stretch.value = v;
    },

    "sparkProps.waveAmp": (v) => {
      sUniforms!.u_wave_amp.value = v;
    },

    "sparkProps.waveFreq": (v) => {
      sUniforms!.u_wave_freq.value = v;
    },
  };

  const update = createGuiUpdater(guiHandlers);

  return { points, step, updtScreen, update };
}
