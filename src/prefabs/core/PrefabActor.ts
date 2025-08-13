// SPDX-License-Identifier: GPL-3.0
// Copyright (C) 2025 Tahsin Ö.
// This file is part of Tarnished-house. See the LICENSE file for details.

import { Group, PositionalAudio, type Object3D } from "three";
import type { Sizes } from "@/types";

type ActorCtor<T extends PrefabActor, O> = new (sizes: Sizes, opts: O) => T;

interface PrefabActorStatics {
  _template: Object3D;
  _resolveReady: () => void;
  _ready: Promise<void>;
}

export class PrefabActor extends Group {
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

  // ---------- Static template lifecycle ----------
  static setTemplate(this: PrefabActorStatics, template: Object3D): void {
    if (!this._ready) {
      this._ready = new Promise<void>(
        (resolve) => (this._resolveReady = resolve)
      );
    }
    this._template = template;
    this._template.updateMatrixWorld(true);
    this._resolveReady?.();
  }

  static async create<T extends PrefabActor, O>(
    this: ActorCtor<T, O> & PrefabActorStatics,
    sizes: Sizes,
    opts: O
  ): Promise<T> {
    if (!this._ready) {
      this._ready = new Promise<void>(
        (resolve) => (this._resolveReady = resolve)
      );
    }
    if (!this._template) await this._ready;
    return new this(sizes, opts);
  }

  static isReady(this: PrefabActorStatics): boolean {
    return !!this._template;
  }

  // ---------- Base step ----------
  step(d: number, _e: number) {
    if (!this._ticks.length) return;
    for (let i = this._ticks.length - 1; i >= 0; i--) {
      if (this._ticks[i](d)) this._ticks.splice(i, 1);
    }
  }

  // ---------- Audio / Fx ----------
  attachAudio(sound: PositionalAudio, dy = 0) {
    this._sound = sound;
    this._root.add(sound);
    sound.position.y += dy;
  }

  attachSfx(sound: PositionalAudio, dy = 0) {
    this._fx = sound;
    this._root.add(sound);
    sound.position.y += dy;
  }

  protected _trigSfx() {
    const s = this._fx;
    if (!s) return;
    if (s.isPlaying) s.stop();
    s.play();
  }

  // ---------- Ease helpers ----------
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

  protected _easeOut(
    set: (v: number) => void,
    { from, to, dur }: { from: number; to: number; dur: number }
  ) {
    let t = 0;
    const tick = (dt: number) => {
      t += dt;
      const k = t >= dur ? 1 : t / dur;
      const e = 1 - Math.pow(1 - k, 3); // cubic-out
      set(from + (to - from) * e);
      return k === 1;
    };
    this._ticks.push(tick);
  }

  protected _killTicks() {
    this._ticks.length = 0;
  }
}
