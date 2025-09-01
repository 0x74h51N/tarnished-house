// SPDX-License-Identifier: GPL-3.0-or-later

/**
 * utils.ts
 *
 * Helper functions for point particle system: position/velocity init,
 * colour updates, and buffer-attribute flagging.
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

import type { BufferGeometry, Color } from "three";
import type { minMax } from "@/types/global.types";

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
