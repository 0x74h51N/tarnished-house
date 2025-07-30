import { AxesHelper, GridHelper, Scene } from "three";
import { HelperParams, HelperState } from "../types";
import GUI from "lil-gui";

export function createHelpers(
  gui: GUI,
  scene: Scene,
  params: HelperParams
): HelperState {
  const state: HelperState = {
    axes: null,
    grid: null,
  };

  function updateAxes() {
    if (state.axes) {
      scene.remove(state.axes);
      state.axes.geometry.dispose();
    }
    state.axes = new AxesHelper(params.axesSize);
    state.axes.position.set(
      params.axesPositionX,
      params.axesPositionY,
      params.axesPositionZ
    );
    if (params.showAxes) scene.add(state.axes);
  }

  function updateGrid() {
    if (state.grid) {
      scene.remove(state.grid);
      state.grid.geometry.dispose();
      state.grid.material.dispose();
    }
    state.grid = new GridHelper(
      params.gridSize,
      params.gridDivisions,
      0xff0000,
      0xffffff
    );
    state.grid.position.y = params.gridPositionY;
    if (params.showGrid) scene.add(state.grid);
  }

  // Create Axes Helper GUI
  const axesFolder = gui.addFolder("Axes Helper");

  axesFolder
    .add(params, "showAxes")
    .name("Show Axes")
    .onChange(() => updateAxes());
  axesFolder
    .add(params, "axesSize", 1, 200)
    .name("Axes Size")
    .onChange(() => updateAxes());
  axesFolder
    .add(params, "axesPositionX", -100, 100, 0.1)
    .name("Axis X")
    .onChange(() => updateAxes());
  axesFolder
    .add(params, "axesPositionY", -100, 100, 0.1)
    .name("Axis Y")
    .onChange(() => updateAxes());
  axesFolder
    .add(params, "axesPositionZ", -100, 100, 0.1)
    .name("Axis Z")
    .onChange(() => updateAxes());
  axesFolder.close();

  // Create Grid Helper GUI
  const gridFolder = gui.addFolder("Grid Helper");

  gridFolder
    .add(params, "showGrid")
    .name("Show Grid")
    .onChange(() => updateGrid());
  gridFolder
    .add(params, "gridSize", 10, 500, 1)
    .name("Grid Size")
    .onChange(() => updateGrid());
  gridFolder
    .add(params, "gridDivisions", 1, 100, 1)
    .name("Divisions")
    .onChange(() => updateGrid());
  gridFolder
    .add(params, "gridPositionY", -5, 5, 0.01)
    .name("Grid Y Position")
    .onChange(() => updateGrid());
  gridFolder.close();

  return state;
}
