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

  InstancedMesh2.prototype.removeLOD = function (
    levelIndex,
    removeObject = true
  ) {
    const info = this.LODinfo;
    const list = info?.render;
    if (!list?.levels) throw new Error("Invalid LOD list.");

    const n = list.levels.length;
    if (levelIndex < 0 || levelIndex >= n) throw new Error("Level index OOB");
    if (n > 1 && levelIndex === 0)
      throw new Error("Cannot remove LOD0 while others exist");

    // Remove whole list if only LOD0 remains
    const [removed] = list.levels.splice(levelIndex, 1);
    list.count?.splice?.(levelIndex, 1);
    if (list.levels.length <= 1) info.render = null;

    const obj = removed.object;

    // Mirror remove on shadow list if that index exists
    const shadow = this.LODinfo?.shadowRender;
    if (shadow?.levels && levelIndex < shadow.levels.length) {
      shadow.levels.splice(levelIndex, 1);
      shadow.count?.splice?.(levelIndex, 1);
      if (shadow.levels.length === 0) this.LODinfo.shadowRender = null;
    }

    // Remove LOD object
    if (removeObject && obj !== this) {
      this.remove(obj);
      const idx = info.objects?.indexOf(obj) ?? -1;
      if (idx !== -1) info.objects.splice(idx, 1);
      this.disposeLOD(obj);
    }

    return this;
  };

  InstancedMesh2.prototype.disposeLOD = (object) => {
    object.geometry.dispose();
    const mat = object.material;
    if (Array.isArray(mat)) for (const m of mat) m.dispose();
    else mat.dispose();
  };

  InstancedMesh2.prototype.removeAllLODs = function (
    removeObjects = true,
    dispose = true
  ) {
    const info = this.LODinfo;
    if (!info) return this;

    const render = info.render;
    const shadow = info.shadowRender;

    const toRemove = [];

    if (render?.levels?.length) {
      for (const lvl of render.levels) {
        const obj = lvl?.object;
        if (obj && obj !== this) toRemove.push(obj);
      }
    }

    if (shadow?.levels?.length) {
      for (const lvl of shadow.levels) {
        const obj = lvl?.object;
        if (obj && obj !== this && !toRemove.includes(obj)) toRemove.push(obj);
      }
    }

    if (render) {
      if (render.levels) render.levels.length = 0;
      if (render.count?.splice) render.count.length = 0;
      info.render = null;
    }
    if (shadow) {
      if (shadow.levels) shadow.levels.length = 0;
      if (shadow.count?.splice) shadow.count.length = 0;
      info.shadowRender = null;
    }
    for (const obj of toRemove) {
      if (removeObjects) {
        this.remove(obj);
        const arr = info.objects;
        if (arr) {
          const idx = arr.indexOf(obj);
          if (idx !== -1) arr.splice(idx, 1);
        }
      }
      if (dispose) this.disposeLOD(obj);
    }

    return this;
  };
})();
