import { minMax } from "@/types";
import { BufferGeometry, Color } from "three";

//Calculational helpers
export function startPos(
  startPozs: { x: number; y: number; z: number },
  pos: Float32Array,
  i3: number = 0,
  area: number
) {
  pos[i3] = startPozs.x + (Math.random() * 2 - 1) * area;
  pos[i3 + 1] = startPozs.y;
  pos[i3 + 2] = startPozs.z + (Math.random() * 2 - 1) * area;
}

export function startVel(v: Float32Array, i3 = 0) {
  v[i3] = (Math.random() - 0.5) * 0.2;
  v[i3 + 1] = Math.random() * 0.5 + 0.2;
  v[i3 + 2] = (Math.random() - 0.5) * 0.2;
}

export function sparkVel(
  v: Float32Array,
  i3 = 0,
  elevDivs: minMax,
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

export function colUpt(
  i: number,
  colsArr: Float32Array,
  col: Color,
  opacity: number
) {
  const i4 = i * 4;
  colsArr[i4] = col.r;
  colsArr[i4 + 1] = col.g;
  colsArr[i4 + 2] = col.b;
  colsArr[i4 + 3] = opacity;
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
