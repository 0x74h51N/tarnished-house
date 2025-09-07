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
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  GLSL3,
  Group,
  Points,
  RawShaderMaterial,
  type Texture,
  TextureLoader,
  Vector2,
  Vector3
} from "three";
import { createGuiUpdater, setCullingSphere, v3 } from "@/utils";
import type { Step } from "../types";
import FS from "./shaders/fragment.frag";
import SparksFS from "./shaders/sparks/fragment.frag";
import SparkVS from "./shaders/sparks/vertex.vert";
import VS from "./shaders/vertex.vert";
import {
  isSmoke,
  isSpark,
  type PointHandlers,
  type PointParticleInterface,
  type PointParticles,
  type SmokeOpts,
  type SparkOpts,
  type SparkProps
} from "./types";
import { colUpt, markAttrFlags, sparkVel, startPos, startVel } from "./utils";

/**
 * Creates a GPU particle system using custom shaders and buffer attributes.
 *
 * * Spawning model:
 * - If `props.instant === true`  → all particles are spawned immediately.
 * - If `props.instant === false` → all particles start "asleep". They become visible gradually
 *   according to `spawnRate` in the step loop.
 *
 * @param texture           - Optional texture for the particles.
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
 * @param props.instant     - Instant prefill of the pool (default: true).
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
    instant = true
  } = props;
  const loader = new TextureLoader();

  let opacity = isSmoke(props) ? props.opacity : 1;

  const sparkProps = isSpark(props) ? props.sparkProps : undefined;

  const clr = new Color(color);

  const smokeTexPath = isSmoke(props) ? props.textures : undefined;

  const texture: Texture = loader.load(smokeTexPath || "");

  const isSparkV = sparkProps?.elevDivs && sparkProps?.speed;

  // ------------------ BUFFERS ------------------
  const position = new Float32Array(maxCount * 3);
  const vel = new Float32Array(maxCount * 3);
  const startTime = new Float32Array(maxCount);
  const sizeArr = new Float32Array(maxCount).fill(size);
  const growthArr = new Float32Array(maxCount).fill(sizeGrowth);
  const fadeArr = new Float32Array(maxCount).fill(fadeRate);
  const anglesArr = new Float32Array(maxCount);
  const colsArr = new Float32Array(maxCount * 4);

  // ------------------ GEOMETRY ------------------
  const geometry = new BufferGeometry();

  geometry.setAttribute("position", new BufferAttribute(position, 3));
  geometry.setAttribute("velocity", new BufferAttribute(vel, 3));
  geometry.setAttribute("startTime", new BufferAttribute(startTime, 1));
  geometry.setAttribute("size", new BufferAttribute(sizeArr, 1));
  geometry.setAttribute("aColor", new BufferAttribute(colsArr, 4));

  if (isSmoke(props)) {
    geometry.setAttribute("sizeGrowth", new BufferAttribute(growthArr, 1));
    geometry.setAttribute("fadeRate", new BufferAttribute(fadeArr, 1));
    geometry.setAttribute("angle", new BufferAttribute(anglesArr, 1));
  }

  const POS_VEL_TIME_KEYS = ["position", "velocity", "startTime"];

  // --------------- Common Uniforms ----------------
  const resolution = new Vector2(
    sizes.width * sizes.pixelRatio,
    sizes.height * sizes.pixelRatio
  );

  const cUniforms = {
    resolution: { value: resolution },
    u_time: { value: 0 },
    u_scale: { value: scaleFactor }
  };

  // -------------- Spark Uniforms -------------------
  let {
    damping = 0,
    stretchFact = 1,
    elevDivs = { min: 0, max: 1 },
    waveFreq = 0,
    waveAmp = 0,
    speed = 1
  } = (isSparkV ? sparkProps : {}) as Partial<SparkProps>;

  const sUniforms = {
    u_damping: { value: damping },
    u_stretch: { value: stretchFact },
    u_axisRatio: { value: new Vector3(0.67, 1.0, 0.67) },
    u_wave_freq: { value: waveFreq },
    u_wave_amp: { value: waveAmp }
  };

  const points = new Group();

  const dTex = texture;
  const uniforms = {
    ...sUniforms,
    ...cUniforms,
    diffuseTexture: { value: dTex }
  };

  const material = new RawShaderMaterial({
    glslVersion: GLSL3,
    uniforms,
    vertexShader: isSparkV ? SparkVS : VS,
    fragmentShader: isSparkV ? SparksFS : FS,
    toneMapped: false,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    dithering: true,
    vertexColors: true
  });

  const pts = new Points(geometry, material);

  const center = v3(props.startPozs);

  setCullingSphere(geometry, center, 10);

  pts.renderOrder = 4;
  points.add(pts);

  //
  // ----------------- Spawnication ----------------
  //
  const INACTIVE_START = 1e9;
  let spawnAccumulator = 0;
  let nextIndex = 0;

  // Spawner
  function spawn(i: number, time: number) {
    const i3 = i * 3;
    startPos(startPozs, position, i3, area);
    if (isSparkV) sparkVel(vel, i3, elevDivs, speed);
    else startVel(vel, i3);
    startTime[i] = time;
  }

  //
  // Initial Spawn
  if (instant) {
    for (let i = 0; i < maxCount; i++) {
      spawn(i, Math.random() * 0.1);

      anglesArr[i] = Math.random() * Math.PI * 2;
      colUpt(i, colsArr, clr, opacity);
    }
    nextIndex = maxCount;
    markAttrFlags(geometry, [...POS_VEL_TIME_KEYS, "angle", "aColor"]);
  } else {
    for (let i = 0; i < maxCount; i++) {
      spawn(i, INACTIVE_START);
      anglesArr[i] = Math.random() * Math.PI * 2;
      colUpt(i, colsArr, clr, opacity);
    }
    markAttrFlags(geometry, [...POS_VEL_TIME_KEYS, "angle", "aColor"]);
  }

  //
  // Animation - Respawn
  const step: Step = (delta) => {
    spawnAccumulator += delta * spawnRate;
    const toSpawn = Math.floor(spawnAccumulator);
    spawnAccumulator -= toSpawn;

    if (toSpawn > 0) {
      for (let s = 0; s < toSpawn; s++) {
        const i = nextIndex % maxCount;
        spawn(i, cUniforms.u_time.value);
        nextIndex++;
      }
      markAttrFlags(geometry, POS_VEL_TIME_KEYS);
    }

    cUniforms.u_time.value += delta * uTimeMult;
  };

  //
  // ------------------ Res Updater ------------------
  //
  function updtScreen(pr: number) {
    resolution.set(window.innerWidth * pr, window.innerHeight * pr);
    /** */
  }

  //
  // ------------------ Particle Updater ------------------
  //

  const guiHandlers: PointHandlers = {
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
      if (v == null) return;
      uTimeMult = v;
    },

    "sparkProps.speed": (v) => {
      speed = v;
    },

    "sparkProps.elevDivs": (v) => {
      elevDivs = { ...v };
    },

    // --- ATTRIBUTES (CPU + flag) ---
    size: (v) => {
      size = v;
      sizeArr.fill(v);
      markAttrFlags(geometry, ["size"]);
    },

    sizeGrowth: (v) => {
      if (v == null) return;
      sizeGrowth = v;
      growthArr.fill(v);
      markAttrFlags(geometry, ["sizeGrowth"]);
    },

    fadeRate: (v) => {
      if (v == null) return;
      fadeRate = v;
      fadeArr.fill(v);
      markAttrFlags(geometry, ["fadeRate"]);
    },

    opacity: (v) => {
      opacity = v;
      for (let i = 0; i < maxCount; i++) colsArr[i * 4 + 3] = v;
      markAttrFlags(geometry, ["aColor"]);
    },

    color: (v) => {
      const c = new Color(v);
      clr.copy(c);
      for (let i = 0; i < maxCount; i++) {
        colUpt(i, colsArr, clr, 1);
      }
      markAttrFlags(geometry, ["aColor"]);
    },

    // --- UNIFORMS ---
    scaleFactor: (v) => {
      cUniforms.u_scale.value = v;
    },

    "sparkProps.damping": (v) => {
      sUniforms.u_damping.value = v;
    },

    "sparkProps.stretchFact": (v) => {
      sUniforms.u_stretch.value = v;
    },

    "sparkProps.waveAmp": (v) => {
      sUniforms.u_wave_amp.value = v;
    },

    "sparkProps.waveFreq": (v) => {
      sUniforms.u_wave_freq.value = v;
    }
  };
  const update = createGuiUpdater(guiHandlers);

  return { points, step, updtScreen, update };
}
