/** biome-ignore-all lint/suspicious/noExplicitAny: This type helper I cant make w/o any! */
import { Vector3, type Vector3Like, Vector4, type Vector4Like } from "three";
import type { DeepPartial } from ".";

export const v3 = (v: Vector3Like): Vector3 => new Vector3(v.x, v.y, v.z);
export const v4 = (v: Vector4Like): Vector4 => new Vector4(v.x, v.y, v.z, v.w);

const isObj = (v: any): v is object => v !== null && typeof v === "object";

export function deepAssign<T>(target: T, src: DeepPartial<T>): T {
  if (!src) return target;
  for (const k in src) {
    const sv = src[k];
    if (sv === undefined) continue;
    const tv = target[k];

    if (isObj(sv) && isObj(tv)) {
      deepAssign(tv, sv);
    } else {
      (target as any)[k] = sv;
    }
  }
  return target;
}
