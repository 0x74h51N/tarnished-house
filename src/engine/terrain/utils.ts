import type { InstancedEntity, InstancedMesh2 } from "@three.ez/instanced-mesh";
import { BufferAttribute, BufferGeometry, PlaneGeometry } from "three";

export function makeTile(
  size: { width: number; height: number },
  seg: { w: number; h: number },
  skirtDepth = 0.15,
  twoSided = true
): BufferGeometry {
  const g = new PlaneGeometry(size.width, size.height, seg.w, seg.h).rotateX(
    -Math.PI / 2
  );
  if (skirtDepth <= 0) return g;

  const pos = Array.from(
    (g.attributes.position as BufferAttribute).array as Float32Array
  );
  const uv = Array.from(
    (g.attributes.uv as BufferAttribute).array as Float32Array
  );
  const idx = g.index ? Array.from(g.index.array as unknown as number[]) : [];

  const cols = seg.w + 1,
    rows = seg.h + 1,
    V0 = pos.length / 3;
  const newPos: number[] = [],
    newUv: number[] = [],
    newIdx: number[] = [];
  const bot = new Map<number, number>();

  const addBot = (ti: number) => {
    let bi = bot.get(ti);
    if (bi !== undefined) return bi;
    const x = pos[3 * ti],
      y = pos[3 * ti + 1] - skirtDepth,
      z = pos[3 * ti + 2];
    const u = uv[2 * ti],
      v = uv[2 * ti + 1];
    bi = V0 + newPos.length / 3;
    newPos.push(x, y, z);
    newUv.push(u, v);
    bot.set(ti, bi);
    return bi;
  };

  const side = (tops: number[]) => {
    for (let i = 0; i < tops.length - 1; i++) {
      const t0 = tops[i],
        t1 = tops[i + 1],
        b0 = addBot(t0),
        b1 = addBot(t1);
      newIdx.push(t0, t1, b1, t0, b1, b0);
      if (twoSided) {
        newIdx.push(b1, t1, t0, b0, b1, t0);
      }
    }
  };

  const id = (x: number, z: number) => z * cols + x;
  const south = Array.from({ length: cols }, (_, x) => id(x, 0));
  const north = Array.from({ length: cols }, (_, x) => id(x, rows - 1));
  const west = Array.from({ length: rows }, (_, z) => id(0, z));
  const east = Array.from({ length: rows }, (_, z) => id(cols - 1, z));

  side(south);
  side(north);
  side(west);
  side(east);

  const P = new Float32Array(pos.length + newPos.length);
  const U = new Float32Array(uv.length + newUv.length);
  const I = new Uint32Array(idx.length + newIdx.length);
  P.set(pos, 0);
  P.set(newPos, pos.length);
  U.set(uv, 0);
  U.set(newUv, uv.length);
  I.set(idx, 0);
  I.set(newIdx, idx.length);

  const out = new BufferGeometry();
  out.setAttribute("position", new BufferAttribute(P, 3));
  out.setAttribute("uv", new BufferAttribute(U, 2));
  out.setIndex(new BufferAttribute(I, 1));
  out.computeVertexNormals();
  return out;
}
export function addTiles(
  inst: InstancedMesh2,
  n: number,
  tileW: number,
  tileH: number
) {
  n |= 0;
  const h = (n - 1) * 0.5;
  inst.addInstances(n * n, (e: InstancedEntity, i: number) => {
    const x = i % n;
    const z = (i / n) | 0;
    e.position.set((x - h) * tileW, 0, (z - h) * tileH);
  });
  if (inst.LODinfo?.render) {
    for (const lvl of inst.LODinfo.render.levels) {
      lvl.object.castShadow = false;
      lvl.object.receiveShadow = true;
    }
  }
}
