// lod-patch.d.ts
import "@three.ez/instanced-mesh";

declare module "@three.ez/instanced-mesh" {
  export type LODLevel = number;

  export interface LODRenderList {
    levels: Array<{
      distance: number;
      hysteresis?: number;
      object: any;
    }>;
    count?: number[];
  }

  interface InstancedMesh2 {
    updateAllLOD(distances?: number[], hysteresis?: number | number[]): this;
    updateAllShadowLOD(
      distances?: number[],
      hysteresis?: number | number[]
    ): this;
    /** @internal */ updateAllLevels(
      renderList: LODRenderList,
      distances: number[] | null,
      hysteresis?: number | number[]
    ): this;
    /** @internal */ updateLevel(
      renderList: LODRenderList,
      levelIndex: number,
      distance: number,
      hysteresis: number
    ): this;
  }
}
