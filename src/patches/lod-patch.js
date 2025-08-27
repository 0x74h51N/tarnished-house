import { InstancedMesh2 } from "@three.ez/instanced-mesh";

(() => {
  InstancedMesh2.prototype.updateLevel = function (
    renderList,
    levelIndex,
    distance,
    hysteresis
  ) {
    if (!renderList) throw new Error("Render list is invalid.");

    const level = renderList.levels[levelIndex];
    if (!level) throw new Error("Cannot update an empty LOD.");

    if (distance != null && !Number.isNaN(distance)) {
      const d2 = distance ** 2;
      level.distance = d2;
    }
    if (hysteresis != null && !Number.isNaN(hysteresis))
      level.hysteresis = hysteresis;

    return this;
  };

  InstancedMesh2.prototype.updateAllLevels = function (
    renderList,
    distances,
    hysteresis
  ) {
    if (!renderList?.levels) throw new Error("Invalid LOD list.");
    const levels = renderList.levels;
    const isRender = this.LODinfo?.render === renderList;

    const start = isRender ? 1 : 0; // for shadowLOD
    if (isRender) levels[0].distance = 0;

    const hasDistances = distances?.length > 0;

    let _distances = [];
    if (hasDistances) {
      _distances =
        isRender && distances[0] === 0
          ? distances.slice(1, Math.min(levels.length, distances.length))
          : distances.slice(
              0,
              Math.min(levels.length - start, distances.length)
            );

      _distances.every((_d, i) => {
        if (i > 0 && _d <= _distances[i - 1])
          throw new Error(
            `LOD distances must be strictly increasing: d[${i - 1}]=${
              _distances[i - 1]
            } < d[${i}]=${_d}`
          );
        return true;
      });
    }
    const total = hasDistances ? _distances.length : levels.length - start;

    for (let i = 0; i < total; i++) {
      const _d = hasDistances ? _distances[i] : undefined;
      const _h = Array.isArray(hysteresis) ? hysteresis[i] : hysteresis;

      this.updateLevel(renderList, start + i, _d, _h);
    }

    return this;
  };

  InstancedMesh2.prototype.updateAllLOD = function (distances, hysteresis) {
    return this.updateAllLevels(this.LODinfo?.render, distances, hysteresis);
  };
  InstancedMesh2.prototype.updateAllShadowLOD = function (
    distances,
    hysteresis
  ) {
    return this.updateAllLevels(
      this.LODinfo?.shadowRender,
      distances,
      hysteresis
    );
  };
})();
export {};
