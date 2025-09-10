import { Box3, Vector3 } from "three";
import type { Player } from "../player";
import type { ColliderController, IntersectableSet } from "./types";

export function createColliderController(
  sets: IntersectableSet[]
): ColliderController {
  const tmp = new Box3();
  const d = new Vector3();

  const collides = (box: Box3): boolean => {
    for (const s of sets) if (s.bvh.intersectBox(box, () => true)) return true;
    return false;
  };

  const blockMovement = (player: Player, dx: number, dz: number) => {
    if (!collides(tmp.copy(player.box).translate(d.set(dx, 0, dz))))
      return { dx, dz, collided: false };

    const okX = !collides(tmp.copy(player.box).translate(d.set(dx, 0, 0)));
    const okZ = !collides(tmp.copy(player.box).translate(d.set(0, 0, dz)));

    return {
      dx: okX ? dx : 0,
      dz: okZ ? dz : 0,
      collided: true
    };
  };

  return { collides, blockMovement };
}
