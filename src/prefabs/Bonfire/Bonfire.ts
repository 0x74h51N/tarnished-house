// SPDX-License-Identifier: GPL-3.0
// Copyright (C) 2025 Tahsin Ö.
// This file is part of Tarnished-house. See the LICENSE file for details.

import {
  createFlame,
  createPointParticles,
  Flame,
  PointParticles,
} from "@/engine";
import {
  type Object3D,
  type Mesh,
  Group,
  Quaternion,
  Vector3,
  MeshStandardMaterial,
} from "three";

import { Sizes } from "@/types";
import { v3 } from "@/utils";
import { BonfireOpts, FireLight } from "./types";
import { createFireLight } from "./fireLight";
import { flameConf, smokeConf, sparkConf, bonfireConf } from "./configs";
import { PrefabActor } from "../core/PrefabActor";

export class Bonfire extends PrefabActor {
  private _smoke: PointParticles;
  private _sparks: PointParticles;
  private _flame: Flame;
  private _fireLight: FireLight;
  private _ignited: boolean;
  private _sword: MeshStandardMaterial;
  private _hilt: MeshStandardMaterial;
  private _cooldown = 0;

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
    this._sparks = createPointParticles({
      sizes: this._sizes,
      props: sparkConf,
    });
    this._flame = createFlame(flameConf);
    this._flame.update("size", 0.2);
    this._snapParticles();
    this._syncFlame();

    // Light
    this._fireLight = createFireLight();
    this._root.add(this._fireLight.light);
    this._fireLight.light.intensity = 0.001;
    this._fireLight.light.shadow.needsUpdate = true;
  }

  // ------ Public API ------
  ignite() {
    if (this._ignited) return;
    this._ignited = true;
    this._killTicks();

    this._trigSfx();
    if (this._sound) this._sound.play();

    // Recover particles
    setTimeout(() => {
      this._sparks.update("reset", true);
    }, 100);
    this._smoke.update("spawnRate", smokeConf.spawnRate);

    this._ease((v) => this._sparks.update("spawnRate", v), {
      from: sparkConf.spawnRate * 4,
      to: sparkConf.spawnRate,
      dur: 3,
    });

    this._ease((v) => this._sparks.update("uTimeMult", v), {
      from: 2,
      to: 1,
      dur: this._cooldown * 0.2,
    });
    this._ease((v) => this._smoke.update("uTimeMult", v), {
      from: 2,
      to: 1,
      dur: this._cooldown * 0.2,
    });

    // Start particles
    this._root.attach(this._flame.flame);
    this._easeOut((v) => this._flame.update("size", v), {
      from: 0.2,
      to: flameConf.size,
      dur: 0.5,
    });

    const startY = this._flame.flame.position.y;

    this._easeOut(
      (y) => {
        this._flame.update("startPozs", {
          ...this._flame.flame.position,
          y: y,
        });
      },
      {
        from: startY,
        to: bonfireConf.dy,
        dur: 1,
      }
    );

    this._staggerAttach(this._sparks.points, bonfireConf.particleFx.sparks);
    this._staggerAttach(
      this._smoke.points,
      bonfireConf.particleFx.smoke,
      (o) => {
        o.position.y += bonfireConf.dy;
      }
    );

    // Emissive ease
    this._ease((v) => (this._sword.emissiveIntensity = v), {
      from: this._sword.emissiveIntensity,
      to: bonfireConf.emissiveFx.to,
      dur: bonfireConf.emissiveFx.dur,
    });
    this._ease((v) => (this._hilt.emissiveIntensity = v), {
      from: this._hilt.emissiveIntensity,
      to: bonfireConf.emissiveFx.to * 0.5,
      dur: bonfireConf.emissiveFx.dur,
    });
  }

  extinguish() {
    if (!this._ignited) return;
    this._ignited = false;
    this._killTicks();

    this._trigSfx();
    if (this._sound?.isPlaying) this._sound.stop();

    this._cooldown = 10;

    // Smoke & spark
    this._smoke.update("spawnRate", 0);
    this._sparks.update("spawnRate", 0);

    this._easeOut((v) => this._smoke.update("uTimeMult", v), {
      from: 1,
      to: 2,
      dur: this._cooldown * 0.3,
    });
    this._easeOut((v) => this._sparks.update("uTimeMult", v), {
      from: 1,
      to: 2,
      dur: this._cooldown * 0.3,
    });

    // Flame size and poz
    this._easeOut((v) => this._flame.update("size", v), {
      from: flameConf.size,
      to: 0,
      dur: 0.7,
    });

    const startY = this._flame.flame.position.y;

    this._easeOut(
      (y) => {
        this._flame.update("startPozs", {
          ...this._flame.flame.position,
          y: y,
        });
      },
      {
        from: startY,
        to: startY - bonfireConf.dy,
        dur: 1,
      }
    );

    this._easeOut((v) => (this._fireLight.light.intensity = v), {
      from: this._fireLight.light.intensity,
      to: 0.01,
      dur: 0.5,
    });

    // Emissive ease
    this._easeOut((v) => (this._sword.emissiveIntensity = v), {
      from: this._sword.emissiveIntensity,
      to: 0,
      dur: this._cooldown * this._sword.emissiveIntensity * 0.3,
    });
    this._easeOut((v) => (this._hilt.emissiveIntensity = v), {
      from: this._hilt.emissiveIntensity,
      to: 0,
      dur: this._cooldown * this._hilt.emissiveIntensity * 0.3,
    });
  }

  // ------ Update loop ------
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

  // ------ Helpers ------
  private _snapParticles() {
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

    apply(this._flame.flame);
    this._smoke.points.children.forEach(apply);
    this._sparks.points.children.forEach(apply);
  }

  private _syncFlame() {
    const p = this._flame.flame.position;
    this._flame.update("startPozs", { x: p.x, y: p.y, z: p.z });
  }

  private _staggerAttach(
    g: Group,
    { intervalMs, delay }: { intervalMs: number; delay: number },
    onEach?: (o: Object3D) => void
  ) {
    const tick = () => {
      if (!g.children.length) return;
      setTimeout(() => {
        if (!this._ignited) return;
        const c = g.children[0];
        this._root.attach(c);
        onEach?.(c);
        setTimeout(tick, intervalMs);
      }, delay);
    };
    tick();
  }
}
