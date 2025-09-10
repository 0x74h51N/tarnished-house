import type { Box3 } from "three";
import type { Player } from "../player";

export type IntersectableSet = {
  bvh: {
    intersectBox: (
      target: Box3,
      onIntersection: (instanceIndex: number) => boolean
    ) => boolean;
  };
};

export type ColliderController = {
  collides: (box: Box3) => boolean;

  blockMovement: (
    player: Player,
    dx: number,
    dz: number
  ) => { dx: number; dz: number; collided: boolean };
};
