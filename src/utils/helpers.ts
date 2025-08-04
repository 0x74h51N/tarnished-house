import { Vector3, Vector3Like } from "three";

export const vec3From = (v: Vector3Like): Vector3 => new Vector3(v.x, v.y, v.z);
