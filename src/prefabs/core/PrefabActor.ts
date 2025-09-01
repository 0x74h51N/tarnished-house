// SPDX-License-Identifier: GPL-3.0
/** biome-ignore-all lint/complexity/noThisInStatic: this is good for abstract */
// Copyright (C) 2025 Tahsin Ö.
// This file is part of Tarnished-house. See the LICENSE file for details.

import {
  type BufferGeometry,
  type BufferGeometryEventMap,
  Group,
  type Material,
  type Mesh,
  type NormalBufferAttributes,
  type Object3D,
  type Object3DEventMap,
  type PositionalAudio,
  Quaternion,
  Vector3
} from "three";
import type { Sizes } from "@/types/global.types";

type ActorCtor<T extends Prefab, O> = abstract new (sizes: Sizes, opts: O) => T;

interface PrefabStatics {
  _template: Object3D;
  _resolveReady: () => void;
  _ready: Promise<void>;
}

/* ===================================================== */
/*                        PREFAB                         */
/* Base class for spawnable scene objects with audio,    */
/* particle helpers, and easing utilities                */
/* ===================================================== */
export abstract class Prefab extends Group {
  protected _root: Group;
  protected _sizes: Sizes;

  protected _ticks: Array<(dt: number) => boolean> = [];
  protected _sound?: PositionalAudio;
  protected _fx?: PositionalAudio;

  static _template: Object3D;
  static _resolveReady: () => void;
  static _ready: Promise<void>;

  constructor(sizes: Sizes) {
    super();
    this._sizes = sizes;
    this._root = new Group();
    this.add(this._root);
  }

  /* ---------- Static template lifecycle ---------- */

  /**
   * Set static template for prefab cloning.
   * @param template - Scene object used as the prefab template.
   * @returns void
   *
   * @sideEffects    - updates template's world matrix, resolves internal ready promise.
   */
  static setTemplate(this: PrefabStatics, template: Object3D): void {
    this._ready ??= new Promise<void>((resolve) => {
      this._resolveReady = resolve;
    });
    this._template = template;
    this._template.updateMatrixWorld(true);
    this._resolveReady?.();
  }

  /**
   * Create prefab instance once template is ready.
   *
   * @param sizes - Viewport/screen sizes.
   * @param opts  - Subclass-specific construction options.
   * @returns     - Promise<T> Instantiated prefab.
   * @throws      - if template is never resolved.
   */
  static async create<T extends Prefab, O>(
    this: ActorCtor<T, O> & PrefabStatics,
    sizes: Sizes,
    opts: O
  ): Promise<T> {
    this._ready ??= new Promise<void>((resolve) => {
      this._resolveReady = resolve;
    });
    if (!this._template) await this._ready;

    const Ctor = this as unknown as new (sizes: Sizes, opts: O) => T;
    return new Ctor(sizes, opts);
  }

  /**
   * Whether a template has been set.
   *
   * @returns boolean
   */
  static isReady(this: PrefabStatics): boolean {
    return !!this._template;
  }

  /* ---------- Update loop ---------- */
  /**
   * Runs per-frame ticks and prunes finished ones.
   *
   * @param d     - Delta time (seconds).
   * @param _e    - Elapsed time (seconds). Unused here.
   * @returns     - void
   * @sideEffects - May mutate internal _ticks array.
   */
  step(d: number, _e: number) {
    if (!this._ticks.length) return;
    for (let i = this._ticks.length - 1; i >= 0; i--) {
      if (this._ticks[i](d)) this._ticks.splice(i, 1);
    }
  }

  // ---------- Audio / Fx ----------
  /**
   * Attach main audio source under the prefab root.
   *
   * @param sound - PositionalAudio
   * @param dy    - Optional Y offset to lift the source.
   * @returns void
   * @sideEffects - sets _sound, re-parents sound to _root, mutates sound.position.y.
   */
  attachAudio(sound: PositionalAudio, dy = 0) {
    this._sound = sound;
    this._root.add(sound);

    sound.position.y += dy; // TODO - vec3 pos settings

    // TODO - make multiple sounds
  }
  /**
   * Attach secondary SFX under the prefab root.
   *
   * @param sound   - PositionalAudio to attach.
   * @param dy      - Optional Y offset to lift the source.
   * @returns void
   * @sideEffects   - sets _fx, re-parents sound to _root, mutates sound.position.y.
   */
  attachSfx(sound: PositionalAudio, dy = 0) {
    this._fx = sound;
    this._root.add(sound);
    sound.position.y += dy;
    // TODO - make multiple sound Fxs
  }

  /**
   * Play SFX
   * restarts if already playing
   * @returns void
   */
  protected _trigSfx() {
    const s = this._fx;
    if (!s) return;
    if (s.isPlaying) s.stop();
    s.play();
  }

  // ------------- Particles ------------
  /**
   * Snap a particle/group to this prefab's current world transform.
   *
   * @param particle  - Single Mesh or Group to align.
   *
   * @returns void
   * @uses  this.matrixWorld
   * @sideEffects mutates target's position/quaternion and updates matrices.
   */
  protected _snapParticle(
    particle:
      | Group<Object3DEventMap>
      | Mesh<
          BufferGeometry<NormalBufferAttributes, BufferGeometryEventMap>,
          Material | Material[],
          Object3DEventMap
        >
  ) {
    this.updateMatrixWorld(true);
    const pos = new Vector3();
    const rot = new Quaternion();
    const scl = new Vector3();
    this.matrixWorld.decompose(pos, rot, scl);

    const apply = (o: Object3D) => {
      o.position.copy(pos);
      o.quaternion.copy(rot);
      o.updateMatrixWorld(true);
    };
    if (particle instanceof Group) particle.children.forEach(apply);
    else apply(particle);
  }

  // ---------- Ease helpers ----------
  /**
   * Schedule a cubic-in easing over time.
   *
   * @param set   - Setter called every frame with interpolated value.
   * @param from  - Start value.
   * @param to    - End value.
   * @param dur   - Duration (seconds).
   *
   * @returns void
   * @sideEffects - pushes a tick into _ticks; tick returns true when finished.
   */
  protected _ease(
    set: (v: number) => void,
    { from, to, dur }: { from: number; to: number; dur: number }
  ) {
    let t = 0;
    const tick = (dt: number) => {
      t += dt;
      const k = t >= dur ? 1 : t / dur;
      const e = k * k * k; // cubic-in
      set(from + (to - from) * e);
      return k === 1;
    };
    this._ticks.push(tick);
  }

  /**
   * Schedule a cubic-out easing over time.
   *
   * @param set   - Setter called every frame with interpolated value.
   * @param from  - Start value.
   * @param to    - End value.
   * @param dur   - Duration (seconds).
   *
   * @returns void
   * @sideEffects - pushes a tick into _ticks; tick returns true when finished.
   */
  protected _easeOut(
    set: (v: number) => void,
    { from, to, dur }: { from: number; to: number; dur: number }
  ) {
    let t = 0;
    const tick = (dt: number) => {
      t += dt;
      const k = t >= dur ? 1 : t / dur;
      const e = 1 - (1 - k) ** 3; // cubic-out
      set(from + (to - from) * e);
      return k === 1;
    };
    this._ticks.push(tick);
  }

  /**
   * Cancel all scheduled ticks/easings immediately.
   *
   * @returns void
   * @sideEffects clears _ticks array (in-flight animations stop).
   */
  protected _killTicks() {
    this._ticks.length = 0;
  }
}
