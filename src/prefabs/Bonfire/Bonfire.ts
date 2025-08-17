// SPDX-License-Identifier: GPL-3.0
// Copyright (C) 2025 Tahsin Ö.
// This file is part of Tarnished-house. See the LICENSE file for details.

import {
  createFlame,
  createPointParticles,
  Flame,
  PointParticles,
} from "@/engine";
import { type Mesh, Group, MeshStandardMaterial } from "three";

import { Sizes } from "@/types/global.types";
import { v3 } from "@/utils";
import { BonfireOpts, FireLight } from "./types";
import { createFireLight } from "./fireLight";
import { flameConf, smokeConf, sparkConf, bonfireConf } from "./configs";
import { Prefab } from "../core/PrefabActor";

/**
 * Bonfire Prefab
 *
 * A reusable prefab actor representing a bonfire with interactive ignite/extinguish states.
 * Handles:
 *  - Particle effects (flame, smoke, sparks)
 *  - Dynamic firelight with animated decay and intensity
 *  - Emissive animation for sword/hilt materials
 *  - Smooth state transitions with easing
 *
 * Public API:
 *  - ignite(): Start flame/particle effects and light
 *  - extinguish(): Stop effects and dim light
 *  - step(): Per-frame update for particles and animations
 */
export class Bonfire extends Prefab {
  private _smoke: PointParticles;
  private _sparks: PointParticles;
  private _flame: Flame;
  private _fireLight: FireLight;
  private _ignited: boolean;
  private _sword: MeshStandardMaterial;
  private _hilt: MeshStandardMaterial;
  private _cooldown = 0;
  private static _nextId = 0;
  private readonly _id: number;

  get smoke(): PointParticles {
    return this._smoke;
  }
  get sparks(): PointParticles {
    return this._sparks;
  }
  get flame(): Flame {
    return this._flame;
  }
  get fireLight(): FireLight {
    return this._fireLight;
  }

  constructor(sizes: Sizes, opts: BonfireOpts) {
    super(sizes);
    this._ignited = false;

    const tmpl = Bonfire._template;
    if (!tmpl)
      throw new Error(
        "Bonfire template not set. Call Bonfire.setTemplate(...) after GLTF load."
      );

    this._id = Bonfire._nextId++;
    const name = `bonfire_${this._id}`;
    this.name = name;
    this._root.name = name;

    const root = (tmpl as Group).clone(true) as Group;

    // Materials
    this._sword = (root.getObjectByName("sword") as Mesh)
      .material as MeshStandardMaterial;

    this._hilt = (root.getObjectByName("hilt") as Mesh)
      .material as MeshStandardMaterial;

    (root.getObjectByName("floor") as Mesh).renderOrder = 3;

    // Transform
    this.scale.setScalar(opts.scale);
    const p = v3(opts.position);
    this.position.copy(p);
    const r = v3(opts.rotation);
    this.rotation.setFromVector3(r);

    this._root.add(root);

    // Particles
    this._smoke = createPointParticles({
      sizes: this._sizes,
      props: smokeConf,
    });
    this._snapParticle(this._smoke.points);

    this._sparks = createPointParticles({
      sizes: this._sizes,
      props: sparkConf,
    });
    this._snapParticle(this._sparks.points);

    this._flame = createFlame(flameConf);
    this._snapParticle(this._flame.flame);

    this._flame.update("size", 0.2);

    // Light
    this._fireLight = createFireLight();
    this._root.add(this._fireLight.light);
    this._fireLight.light.intensity = bonfireConf.fireLight.minIntensity;
    this._fireLight.light.shadow.needsUpdate = true;
  }

  /*
  /* ====================== PUBLIC APIs ======================
  */

  /**
   * Starts the ignition sequence for the bonfire.
   * Triggers particle effects, light changes, and emissive animations.
   *
   * @returns void
   */
  ignite() {
    if (this._ignited) return;
    this._ignited = true;
    this._killTicks();

    this._trigSfx();
    if (this._sound) this._sound.play();

    //
    // Recover particle states
    this._sparks.update("reset", true);

    this._smoke.update("spawnRate", smokeConf.spawnRate);

    this._ease((v) => this._sparks.update("spawnRate", v), {
      from:
        sparkConf.spawnRate *
        bonfireConf.particleFx.sparks.spawnRamp.fromFactor,
      to: sparkConf.spawnRate,
      dur: bonfireConf.particleFx.sparks.spawnRamp.dur,
    });

    // Attach root
    this._root.attach(this._sparks.points);
    this._root.attach(this._smoke.points);

    // Animate time multiplier for smoke/sparks
    this._ease((v) => this._sparks.update("uTimeMult", v), {
      from: bonfireConf.particleFx.uTimeMult.ignite.from,
      to: bonfireConf.particleFx.uTimeMult.ignite.to,
      dur: this._cooldown * bonfireConf.timings.cooldownEaseIgnite,
    });
    this._ease((v) => this._smoke.update("uTimeMult", v), {
      from: bonfireConf.particleFx.uTimeMult.ignite.from,
      to: bonfireConf.particleFx.uTimeMult.ignite.to,
      dur: this._cooldown * bonfireConf.timings.cooldownEaseIgnite,
    });

    // Light decay
    this._easeOut((v) => (this._fireLight.light.decay = v), {
      from: bonfireConf.fireLight.decayStart,
      to: bonfireConf.fireLight.decay,
      dur: bonfireConf.timings.decayEaseInDur,
    });

    // Flame growth
    this._root.attach(this._flame.flame);
    this._easeOut((v) => this._flame.update("size", v), {
      from: bonfireConf.flame.initialSize,
      to: flameConf.size,
      dur: bonfireConf.timings.flameSizeIgniteDur,
    });

    // Flame Y
    const p = this._flame.flame.position;
    const startY = p.y;

    this._easeOut(
      (y) => {
        p.y = y;
        this._flame.update("startPozs", p);
      },
      { from: startY, to: bonfireConf.dy, dur: bonfireConf.timings.flamePosDur }
    );

    // Emissive intensity animation for sword & hilt
    this._ease((v) => (this._sword.emissiveIntensity = v), {
      from: this._sword.emissiveIntensity,
      to: bonfireConf.swordEmiFx.to,
      dur: bonfireConf.swordEmiFx.dur,
    });
    this._ease((v) => (this._hilt.emissiveIntensity = v), {
      from: this._hilt.emissiveIntensity,
      to: bonfireConf.swordEmiFx.to * 0.5,
      dur: bonfireConf.swordEmiFx.dur,
    });
  }

  /**
   * Starts the ignition sequence for the bonfire.
   * Triggers particle effects, light changes, and emissive animations.
   *
   * @returns void
   */
  extinguish() {
    if (!this._ignited) return;
    this._ignited = false;
    this._killTicks();

    this._trigSfx();
    if (this._sound?.isPlaying) this._sound.stop();

    this._cooldown = bonfireConf.cooldown;

    // Stop particle spawn
    this._smoke.update("spawnRate", 0);
    this._sparks.update("spawnRate", 0);

    // Animate time multiplier decay
    this._easeOut((v) => this._smoke.update("uTimeMult", v), {
      from: bonfireConf.particleFx.uTimeMult.extinguish.from,
      to: bonfireConf.particleFx.uTimeMult.extinguish.to,
      dur: this._cooldown * bonfireConf.timings.cooldownEaseExtinguish,
    });

    this._easeOut((v) => this._sparks.update("uTimeMult", v), {
      from: bonfireConf.particleFx.uTimeMult.extinguish.from,
      to: bonfireConf.particleFx.uTimeMult.extinguish.to,
      dur: this._cooldown * bonfireConf.timings.cooldownEaseExtinguish,
    });

    // Flame size
    this._easeOut((v) => this._flame.update("size", v), {
      from: flameConf.size,
      to: 0,
      dur: bonfireConf.timings.flameSizeExtinguishDur,
    });

    // Flame Y
    const p = this._flame.flame.position;
    const startY = p.y;

    this._easeOut(
      (y) => {
        p.y = y;
        this._flame.update("startPozs", p);
      },
      {
        from: startY,
        to: startY - bonfireConf.dy,
        dur: bonfireConf.timings.flamePosDur,
      }
    );

    // Light decay
    this._easeOut((v) => (this._fireLight.light.decay = v), {
      from: bonfireConf.fireLight.decay,
      to: bonfireConf.fireLight.decayExtinguishTo,
      dur: bonfireConf.timings.decayExtinguishDur,
    });

    // Light intensity fade
    this._easeOut((v) => (this._fireLight.light.intensity = v), {
      from: this._fireLight.light.intensity * 0.5,
      to: bonfireConf.fireLight.minIntensity,
      dur: Math.max(
        this._sword.emissiveIntensity * 0.7,
        bonfireConf.swordEmiFx.dur * 0.5
      ),
    });

    // Emissive fade out
    this._easeOut((v) => (this._sword.emissiveIntensity = v), {
      from: this._sword.emissiveIntensity,
      to: 0,
      dur: Math.max(
        this._sword.emissiveIntensity,
        bonfireConf.swordEmiFx.dur * 0.6
      ),
    });

    this._easeOut((v) => (this._hilt.emissiveIntensity = v), {
      from: this._hilt.emissiveIntensity,
      to: 0,
      dur: Math.max(
        this._hilt.emissiveIntensity,
        bonfireConf.swordEmiFx.dur * 0.6
      ),
    });
  }

  /**
   * Update loop for the Bonfire entity.
   *
   * @param d Delta Time
   * @param e Elapsed Time
   * @returns void
   */
  step(d: number, e: number) {
    super.step(d, e);

    const alive = this._ignited || this._cooldown > 0;
    if (!alive) return;

    if (this._ignited) this._fireLight.animator.update(e);

    this._smoke.step(d);
    this._sparks.step(d);
    this._flame.step(d);

    if (!this._ignited && this._cooldown > 0) {
      this._cooldown -= d;
      if (this._cooldown <= 0) this._cooldown = 0;
    }
  }
}
