import GUI from "lil-gui";
import config from "config.json";
import {
  NoiseParams,
  ParticleSystemRefs,
  FlameProps,
  PointProps,
} from "@/engine";
import { minMax } from "@/types";

export function createParticleSettings(
  gui: GUI,
  particleSystems: ParticleSystemRefs
) {
  const particlesFolder = gui.addFolder("Particles Settings");
  particlesFolder.close();

  const flameConfig = config.assets.particles.flame;
  const smokeConfig = config.assets.particles.smoke;
  const sparksConfig = config.assets.particles.sparks;

  if (!flameConfig || !smokeConfig || !sparksConfig) {
    console.error("Particle configurations not found in config");
    return;
  }

  const flameFolder = particlesFolder.addFolder("Flame");
  flameFolder.close();

  const flameParams = flameConfig.properties as FlameProps;

  flameFolder
    .add(flameParams, "size", 0.1, 3, 0.01)
    .name("Size")
    .onChange((v: number) => {
      particleSystems.flame!.update("size", v);
    });

  flameFolder
    .add(flameParams, "speed", 0.1, 10, 0.1)
    .name("Speed")
    .onChange((v: number) => {
      particleSystems.flame!.update("speed", v);
    });

  flameFolder
    .addColor(flameParams, "color")
    .name("Color")
    .onChange((v: string) => {
      particleSystems.flame!.update("color", v);
    });

  flameFolder
    .add(flameParams, "colorMixStr", 0, 1, 0.01)
    .name("Color Mix Strength")
    .onChange((v: number) => {
      particleSystems.flame!.update("colorMixStr", v);
    });

  const flamePositionFolder = flameFolder.addFolder("Position");
  flamePositionFolder.close();

  flamePositionFolder
    .add(flameParams.startPozs, "x", -5, 5, 0.01)
    .name("X Position")
    .onChange((v: number) => {
      const newPos = { ...flameParams.startPozs, x: v };
      particleSystems.flame!.update("startPozs", newPos);
    });

  flamePositionFolder
    .add(flameParams.startPozs, "y", 0, 3, 0.01)
    .name("Y Position")
    .onChange((v: number) => {
      const newPos = { ...flameParams.startPozs, y: v };
      particleSystems.flame!.update("startPozs", newPos);
    });

  flamePositionFolder
    .add(flameParams.startPozs, "z", -5, 5, 0.01)
    .name("Z Position")
    .onChange((v: number) => {
      const newPos = { ...flameParams.startPozs, z: v };
      particleSystems.flame!.update("startPozs", newPos);
    });

  const flameNoiseFolder = flameFolder.addFolder("Noise");
  flameNoiseFolder.close();

  flameNoiseFolder
    .add(flameParams.noise, "magnitude", 0.1, 5, 0.01)
    .name("Magnitude")
    .onChange((v: number) => {
      particleSystems.flame!.update("noise.magnitude", v);
    });

  flameNoiseFolder
    .add(flameParams.noise, "lacunarity", 1, 4, 0.01)
    .name("Lacunarity")
    .onChange((v: number) => {
      const newNoise: NoiseParams = {
        ...flameParams.noise,
        lacunarity: v,
      };
      particleSystems.flame!.update("noise", newNoise);
    });

  flameNoiseFolder
    .add(flameParams.noise, "gain", 0.1, 1, 0.01)
    .name("Gain")
    .onChange((v: number) => {
      const newNoise: NoiseParams = { ...flameParams.noise, gain: v };
      particleSystems.flame!.update("noise", newNoise);
    });

  flameNoiseFolder
    .add(flameParams.noise, "octaves", 1, 8, 1)
    .name("Octaves")
    .onChange((v: number) => {
      const newNoise: NoiseParams = {
        ...flameParams.noise,
        octaves: v,
      };
      particleSystems.flame!.update("noise", newNoise);
    });

  // Smoke
  const smokeFolder = particlesFolder.addFolder("Smoke");
  smokeFolder.close();

  const smokeParams = smokeConfig.properties as PointProps;

  smokeFolder
    .add(smokeParams, "area", 0.1, 2, 0.01)
    .name("Area")
    .onChange((v: number) => {
      particleSystems.smoke!.update("area", v);
    });

  smokeFolder
    .add(smokeParams, "size", 0.1, 2, 0.01)
    .name("Size")
    .onChange((v: number) => {
      particleSystems.smoke!.update("size", v);
    });

  smokeFolder
    .add(smokeParams, "spawnRate", 0.1, 10, 0.1)
    .name("Spawn Rate")
    .onChange((v: number) => {
      particleSystems.smoke!.update("spawnRate", v);
    });

  smokeFolder
    .add(smokeParams, "opacity", 0, 1, 0.01)
    .name("Opacity")
    .onChange((v: number) => {
      particleSystems.smoke!.update("opacity", v);
    });

  smokeFolder
    .addColor(smokeParams, "color")
    .name("Color")
    .onChange((v: string) => {
      particleSystems.smoke!.update("color", v);
    });

  smokeFolder
    .add(smokeParams, "sizeGrowth", 0, 2, 0.01)
    .name("Size Growth")
    .onChange((v: number) => {
      particleSystems.smoke!.update("sizeGrowth", v);
    });

  smokeFolder
    .add(smokeParams, "fadeRate", 0.01, 0.5, 0.01)
    .name("Fade Rate")
    .onChange((v: number) => {
      particleSystems.smoke!.update("fadeRate", v);
    });

  smokeFolder
    .add(smokeParams, "scaleFactor", 0.5, 5, 0.01)
    .name("Scale Factor")
    .onChange((v: number) => {
      particleSystems.smoke!.update("scaleFactor", v);
    });

  // Sparks
  const sparksFolder = particlesFolder.addFolder("Sparks");
  sparksFolder.close();

  const sparksParams = sparksConfig.properties as PointProps;

  sparksFolder
    .addColor(sparksParams, "color")
    .name("Color")
    .onChange((v: string) => {
      particleSystems.sparks!.update("color", v);
    });

  sparksFolder
    .add(sparksParams, "area", 0.1, 1, 0.01)
    .name("Area")
    .onChange((v: number) => {
      particleSystems.sparks!.update("area", v);
    });

  sparksFolder
    .add(sparksParams, "size", 0.01, 0.5, 0.001)
    .name("Size")
    .onChange((v: number) => {
      particleSystems.sparks!.update("size", v);
    });

  sparksFolder
    .add(sparksParams, "spawnRate", 1, 30, 0.1)
    .name("Spawn Rate")
    .onChange((v: number) => {
      particleSystems.sparks!.update("spawnRate", v);
    });

  sparksFolder
    .add(sparksParams, "speed", 1, 10, 0.1)
    .name("Speed")
    .onChange((v: number) => {
      particleSystems.sparks!.update("speed", v);
    });

  sparksFolder
    .add(sparksParams.sparkProps!, "damping", 0.1, 1, 0.01)
    .name("Damping")
    .onChange((v: number) => {
      particleSystems.sparks!.update("sparkProps.damping", v);
    });

  sparksFolder
    .add(sparksParams.sparkProps!, "stretchFact", 1, 20, 0.1)
    .name("Stretch Factor")
    .onChange((v: number) => {
      particleSystems.sparks!.update("sparkProps.stretchFact", v);
    });

  sparksFolder
    .add(sparksParams.sparkProps!, "waveAmp", 0, 1, 0.001)
    .name("Wave Amptitude")
    .onChange((v: number) => {
      particleSystems.sparks!.update("sparkProps.waveAmp", v);
    });

  sparksFolder
    .add(sparksParams.sparkProps!, "waveFreq", 1, 20, 0.5)
    .name("Wave Frequency")
    .onChange((v: number) => {
      particleSystems.sparks!.update("sparkProps.waveFreq", v);
    });

  const elevationFolder = sparksFolder.addFolder("Elevation");
  elevationFolder.close();

  elevationFolder
    .add(sparksParams.sparkProps!.elevDivs!, "min", 1, 15, 0.1)
    .name("Min Elevation")
    .onChange((v: number) => {
      const newElevDivs: minMax = {
        ...sparksParams.sparkProps!.elevDivs!,
        min: v,
      };
      particleSystems.sparks!.update("sparkProps.elevDivs", newElevDivs);
    });

  elevationFolder
    .add(sparksParams.sparkProps!.elevDivs!, "max", 1, 15, 0.1)
    .name("Max Elevation")
    .onChange((v: number) => {
      const newElevDivs: minMax = {
        ...sparksParams.sparkProps!.elevDivs!,
        max: v,
      };
      particleSystems.sparks!.update("sparkProps.elevDivs", newElevDivs);
    });
}
