import {
  createFlame,
  createPointParticles,
  Flame,
  FlameProps,
  PointParticles,
  SmokeOpts,
  SparkOpts,
} from "@/engine";
import {
  type Object3D,
  type Mesh,
  Group,
  Quaternion,
  Vector3,
  MeshStandardMaterial,
  PositionalAudio,
} from "three";

import { Sizes } from "@/types";
import { v3 } from "@/utils";
import { BonfireOpts, FireLight } from "./types";
import { createFireLight } from "./fireLight";
import { flameConfig, smokeConfig, sparkConfig } from "./configs";

const smoke = smokeConfig as SmokeOpts;
const flame = flameConfig as FlameProps;
const spark = sparkConfig as SparkOpts;

export class Bonfire extends Group {
  private static _template: Object3D;

  private static _resolveReady?: () => void;
  private static _ready = new Promise<void>((r) => (Bonfire._resolveReady = r));

  static setTemplate(template: Object3D): void {
    this._template = template;
    this._template.updateMatrixWorld(true);
    this._resolveReady?.();
  }

  static async create(sizes: Sizes, opts: BonfireOpts) {
    if (!this._template) await this._ready;
    return new Bonfire(sizes, opts);
  }

  static isReady(): boolean {
    return !!this._template;
  }

  private _root: Group;
  private _sizes: Sizes;
  private _smoke: PointParticles;
  private _sparks: PointParticles;
  private _flame: Flame;
  private _fireLight: FireLight;
  private _ignited: boolean;
  private _sword: MeshStandardMaterial;
  private _hilt: MeshStandardMaterial;
  private _emiTick?: (dt: number) => void;
  private _sound?: PositionalAudio;
  private _igniteEfc?: PositionalAudio;

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
    super();
    this._sizes = sizes;
    this._ignited = false;

    const tmpl = Bonfire._template;
    if (!tmpl) {
      throw new Error(
        "Bonfire template not set. Call Bonfire.setTemplate(...) once after GLTF load."
      );
    }

    const root = (tmpl as Group).clone(true) as Group;

    // Materials
    this._sword = (root.getObjectByName("sword") as Mesh)
      .material as MeshStandardMaterial;
    this._hilt = (root.getObjectByName("hilt") as Mesh)
      .material as MeshStandardMaterial;
    const floor = root.getObjectByName("floor") as Mesh;

    floor.renderOrder = 3;

    // Bonfire scale and positions
    this.scale.setScalar(opts.scale);
    const p = v3(opts.position);
    this.position.copy(p);

    const r = v3(opts.rotation);
    this.rotation.setFromVector3(r);

    this._root = root;
    this.add(root);

    // Particles
    this._smoke = createPointParticles({
      sizes: this._sizes,
      props: smoke,
    });

    this._sparks = createPointParticles({
      sizes: this._sizes,
      props: spark,
    });

    this._flame = createFlame(flame);
    this._snapParticles();
    this._syncFlame();

    this._fireLight = createFireLight();
  }

  attachAudio(sound: PositionalAudio, dy = 0.25) {
    this._sound = sound;
    this._root.add(sound);
    sound.position.y += dy;
  }

  attachIgnite(sound: PositionalAudio) {
    this._igniteEfc = sound;
    this._root.add(sound);
  }

  ignite() {
    if (this._ignited) return;

    const dy = 0.25;
    const delay = 50;
    this._ignited = true;

    if (this._igniteEfc) this._igniteEfc.play();

    this._root.add(this._fireLight.light);
    this._fireLight.light.position.y += dy;
    this._attachFlame(dy);

    this._staggerAttach(this._sparks.points, 10, delay);
    this._staggerAttach(this._smoke.points, 2400, delay, (o) => {
      o.position.y += dy;
    });
    if (this._sound && !this._sound.isPlaying) {
      this._sound.play();
    }

    this._startEmissive(10, 14);
  }

  step(d: number, e: number) {
    if (!this._ignited) return;
    this._emiTick?.(d);
    this._smoke.step(d);
    this._sparks.step(d);
    this._flame.step(d);
    this._fireLight.animator.update(e);
  }

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

  //Helpers
  private _syncFlame() {
    const p = this._flame.flame.position;
    this._flame.update("startPozs", { x: p.x, y: p.y, z: p.z });
  }

  private _attachFlame(dy: number) {
    this._root.attach(this._flame.flame);
    this._flame.flame.position.y += dy;
    const p = this._flame.flame.position;
    this._flame.update("startPozs", { x: p.x, y: p.y, z: p.z });
  }

  private _staggerAttach(
    g: Group,
    intervalMs: number,
    delay: number,
    onEach?: (o: Object3D) => void
  ) {
    const tick = () => {
      if (!g.children.length) return;
      setTimeout(() => {
        const c = g.children[0];
        this._root.attach(c);
        onEach?.(c);
        setTimeout(tick, intervalMs);
      }, delay);
    };
    tick();
  }

  private _startEmissive(to: number, dur: number) {
    const from = 0;
    let t = 0;
    this._emiTick = (dt) => {
      t += dt;
      const k = Math.min(1, t / dur);
      const eased = k * k * k;
      this._sword.emissiveIntensity = from + (to - from) * eased;
      this._hilt.emissiveIntensity = (from + (to - from) * eased) * 0.5;
      if (k === 1) this._emiTick = undefined;
    };
  }
}
