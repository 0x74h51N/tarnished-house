import GUI from "lil-gui";
import config from "../../../../config.json";
import {
  PointParticlesInterface,
  FlameParticlesInterface,
  NoiseParams,
  ElevationDividers,
  ParticleSystemRefs,
} from "../../particles/types";

export function createParticleSettings(
  gui: GUI,
  particleSystems: ParticleSystemRefs
) {
  const particlesFolder = gui.addFolder("Particles Settings");
  particlesFolder.close();

  const flameConfig = config.assets.particles.find((p) => p.name === "flame");
  const smokeConfig = config.assets.particles.find((p) => p.name === "smoke");
  const sparksConfig = config.assets.particles.find((p) => p.name === "sparks");

  if (!flameConfig || !smokeConfig || !sparksConfig) {
    console.error("Particle configurations not found in config");
    return;
  }

  const flameFolder = particlesFolder.addFolder("Flame");
  flameFolder.close();

  const flameParams = flameConfig.properties as FlameParticlesInterface;

  flameFolder
    .add(flameParams, "size", 0.1, 3, 0.01)
    .name("Size")
    .onChange((value: number) => {
      particleSystems.flame!.update("size", value);
    });

  flameFolder
    .add(flameParams, "speed", 0.1, 10, 0.1)
    .name("Speed")
    .onChange((value: number) => {
      particleSystems.flame!.update("speed", value);
    });

  flameFolder
    .addColor(flameParams, "color")
    .name("Color")
    .onChange((value: string) => {
      particleSystems.flame!.update("color", value);
    });

  flameFolder
    .add(flameParams, "colorMixStr", 0, 1, 0.01)
    .name("Color Mix Strength")
    .onChange((value: number) => {
      particleSystems.flame!.update("colorMixStr", value);
    });

  const flamePositionFolder = flameFolder.addFolder("Position");
  flamePositionFolder.close();

  flamePositionFolder
    .add(flameParams.startPozs, "x", -5, 5, 0.01)
    .name("X Position")
    .onChange((value: number) => {
      const newPos = { ...flameParams.startPozs, x: value };
      particleSystems.flame!.update("startPozs", newPos);
    });

  flamePositionFolder
    .add(flameParams.startPozs, "y", 0, 3, 0.01)
    .name("Y Position")
    .onChange((value: number) => {
      const newPos = { ...flameParams.startPozs, y: value };
      particleSystems.flame!.update("startPozs", newPos);
    });

  flamePositionFolder
    .add(flameParams.startPozs, "z", -5, 5, 0.01)
    .name("Z Position")
    .onChange((value: number) => {
      const newPos = { ...flameParams.startPozs, z: value };
      particleSystems.flame!.update("startPozs", newPos);
    });

  const flameNoiseFolder = flameFolder.addFolder("Noise");
  flameNoiseFolder.close();

  flameNoiseFolder
    .add(flameParams.noise, "magnitude", 0.1, 5, 0.01)
    .name("Magnitude")
    .onChange((value: number) => {
      const newNoise: NoiseParams = {
        ...flameParams.noise,
        magnitude: value,
      };
      particleSystems.flame!.update("noise", newNoise);
    });

  flameNoiseFolder
    .add(flameParams.noise, "lacunarity", 1, 4, 0.01)
    .name("Lacunarity")
    .onChange((value: number) => {
      const newNoise: NoiseParams = {
        ...flameParams.noise,
        lacunarity: value,
      };
      particleSystems.flame!.update("noise", newNoise);
    });

  flameNoiseFolder
    .add(flameParams.noise, "gain", 0.1, 1, 0.01)
    .name("Gain")
    .onChange((value: number) => {
      const newNoise: NoiseParams = { ...flameParams.noise, gain: value };
      particleSystems.flame!.update("noise", newNoise);
    });

  flameNoiseFolder
    .add(flameParams.noise, "octaves", 1, 8, 1)
    .name("Octaves")
    .onChange((value: number) => {
      const newNoise: NoiseParams = {
        ...flameParams.noise,
        octaves: value,
      };
      particleSystems.flame!.update("noise", newNoise);
    });

  const flameMarchFolder = flameFolder.addFolder("Ray Marching");
  flameMarchFolder.close();

  flameMarchFolder
    .add(flameParams.march, "iterations", 10, 50, 1)
    .name("Iterations")
    .onChange((value: number) => {
      const newMarch = {
        ...flameParams.march,
        iterations: value,
      };
      particleSystems.flame!.update("march", newMarch);
    });

  flameMarchFolder
    .add(flameParams.march, "rayStepFactor", 0.01, 0.1, 0.001)
    .name("Ray Step Factor")
    .onChange((value: number) => {
      const newMarch = {
        ...flameParams.march,
        rayStepFactor: value,
      };
      particleSystems.flame!.update("march", newMarch);
    });

  // Smoke
  const smokeFolder = particlesFolder.addFolder("Smoke");
  smokeFolder.close();

  const smokeParams = smokeConfig.properties as PointParticlesInterface;

  smokeFolder
    .add(smokeParams, "area", 0.1, 2, 0.01)
    .name("Area")
    .onChange((value: number) => {
      particleSystems.smoke!.update("area", value);
    });

  smokeFolder
    .add(smokeParams, "size", 0.1, 2, 0.01)
    .name("Size")
    .onChange((value: number) => {
      particleSystems.smoke!.update("size", value);
    });

  smokeFolder
    .add(smokeParams, "spawnRate", 0.1, 10, 0.1)
    .name("Spawn Rate")
    .onChange((value: number) => {
      particleSystems.smoke!.update("spawnRate", value);
    });

  smokeFolder
    .add(smokeParams, "opacity", 0, 1, 0.01)
    .name("Opacity")
    .onChange((value: number) => {
      particleSystems.smoke!.update("opacity", value);
    });

  smokeFolder
    .addColor(smokeParams, "color")
    .name("Color")
    .onChange((value: string) => {
      particleSystems.smoke!.update("color", value);
    });

  smokeFolder
    .add(smokeParams, "sizeGrowth", 0, 2, 0.01)
    .name("Size Growth")
    .onChange((value: number) => {
      particleSystems.smoke!.update("sizeGrowth", value);
    });

  smokeFolder
    .add(smokeParams, "fadeRate", 0.01, 0.5, 0.01)
    .name("Fade Rate")
    .onChange((value: number) => {
      particleSystems.smoke!.update("fadeRate", value);
    });

  smokeFolder
    .add(smokeParams, "scaleFactor", 0.5, 5, 0.01)
    .name("Scale Factor")
    .onChange((value: number) => {
      particleSystems.smoke!.update("scaleFactor", value);
    });

  // Sparks
  const sparksFolder = particlesFolder.addFolder("Sparks");
  sparksFolder.close();

  const sparksParams = sparksConfig.properties as PointParticlesInterface;

  sparksFolder
    .addColor(sparksParams, "color")
    .name("Color")
    .onChange((value: string) => {
      particleSystems.sparks!.update("color", value);
    });

  sparksFolder
    .add(sparksParams, "area", 0.1, 1, 0.01)
    .name("Area")
    .onChange((value: number) => {
      particleSystems.sparks!.update("area", value);
    });

  sparksFolder
    .add(sparksParams, "size", 0.01, 0.5, 0.001)
    .name("Size")
    .onChange((value: number) => {
      particleSystems.sparks!.update("size", value);
    });

  sparksFolder
    .add(sparksParams, "spawnRate", 1, 30, 0.1)
    .name("Spawn Rate")
    .onChange((value: number) => {
      particleSystems.sparks!.update("spawnRate", value);
    });

  sparksFolder
    .add(sparksParams, "speed", 1, 10, 0.1)
    .name("Speed")
    .onChange((value: number) => {
      particleSystems.sparks!.update("speed", value);
    });

  sparksFolder
    .add(sparksParams, "damping", 0.1, 1, 0.01)
    .name("Damping")
    .onChange((value: number) => {
      particleSystems.sparks!.update("damping", value);
    });

  sparksFolder
    .add(sparksParams, "stretchFact", 1, 20, 0.1)
    .name("Stretch Factor")
    .onChange((value: number) => {
      particleSystems.sparks!.update("stretchFact", value);
    });

  const elevationFolder = sparksFolder.addFolder("Elevation");
  elevationFolder.close();

  elevationFolder
    .add(sparksParams.elevDivs!, "min", 1, 15, 0.1)
    .name("Min Elevation")
    .onChange((value: number) => {
      const newElevDivs: ElevationDividers = {
        ...sparksParams.elevDivs!,
        min: value,
      };
      particleSystems.sparks!.update("elevDivs", newElevDivs);
    });

  elevationFolder
    .add(sparksParams.elevDivs!, "max", 1, 15, 0.1)
    .name("Max Elevation")
    .onChange((value: number) => {
      const newElevDivs: ElevationDividers = {
        ...sparksParams.elevDivs!,
        max: value,
      };
      particleSystems.sparks!.update("elevDivs", newElevDivs);
    });
}
