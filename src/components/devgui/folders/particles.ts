import type GUI from "lil-gui";
import type { NoiseParams } from "@/engine";
import {
  type BonfireParticles,
  flameConf,
  smokeConf,
  sparkConf
} from "@/prefabs";
import type { minMax } from "@/types/global.types";

export function createParticleSettings(
  gui: GUI,
  particleSystems: BonfireParticles
) {
  const particlesFolder = gui.addFolder("Particles Settings");
  particlesFolder.close();

  if (!sparkConf || !smokeConf || !flameConf) {
    console.error("Particle configurations not found in config");
    return;
  }

  const flameFolder = particlesFolder.addFolder("Flame");
  flameFolder.close();

  flameFolder
    .add(flameConf, "size", 0.1, 3, 0.01)
    .name("Size")
    .onChange((v: number) => {
      particleSystems.flame.update("size", v);
    });

  flameFolder
    .add(flameConf, "uTimeMult", 0.1, 10, 0.1)
    .name("Speed")
    .onChange((v: number) => {
      particleSystems.flame.update("uTimeMult", v);
    });

  flameFolder
    .addColor(flameConf, "color")
    .name("Color")
    .onChange((v: string) => {
      particleSystems.flame.update("color", v);
    });

  flameFolder
    .add(flameConf, "colorMixStr", 0, 1, 0.01)
    .name("Color Mix Strength")
    .onChange((v: number) => {
      particleSystems.flame.update("colorMixStr", v);
    });

  const flamePositionFolder = flameFolder.addFolder("Position");
  flamePositionFolder.close();

  flamePositionFolder
    .add(flameConf.startPozs, "x", -5, 5, 0.01)
    .name("X Position")
    .onChange((v: number) => {
      const newPos = { ...flameConf.startPozs, x: v };
      particleSystems.flame.update("startPozs", newPos);
    });

  flamePositionFolder
    .add(flameConf.startPozs, "y", 0, 3, 0.01)
    .name("Y Position")
    .onChange((v: number) => {
      const newPos = { ...flameConf.startPozs, y: v };
      particleSystems.flame.update("startPozs", newPos);
    });

  flamePositionFolder
    .add(flameConf.startPozs, "z", -5, 5, 0.01)
    .name("Z Position")
    .onChange((v: number) => {
      const newPos = { ...flameConf.startPozs, z: v };
      particleSystems.flame.update("startPozs", newPos);
    });

  const flameNoiseFolder = flameFolder.addFolder("Noise");
  flameNoiseFolder.close();

  flameNoiseFolder
    .add(flameConf.noise, "magnitude", 0.1, 5, 0.01)
    .name("Magnitude")
    .onChange((v: number) => {
      particleSystems.flame.update("noise.magnitude", v);
    });

  flameNoiseFolder
    .add(flameConf.noise, "lacunarity", 1, 4, 0.01)
    .name("Lacunarity")
    .onChange((v: number) => {
      const newNoise: NoiseParams = {
        ...flameConf.noise,
        lacunarity: v
      };
      particleSystems.flame.update("noise", newNoise);
    });

  flameNoiseFolder
    .add(flameConf.noise, "gain", 0.1, 1, 0.01)
    .name("Gain")
    .onChange((v: number) => {
      const newNoise: NoiseParams = { ...flameConf.noise, gain: v };
      particleSystems.flame.update("noise", newNoise);
    });

  flameNoiseFolder
    .add(flameConf.noise, "octaves", 1, 8, 1)
    .name("Octaves")
    .onChange((v: number) => {
      const newNoise: NoiseParams = {
        ...flameConf.noise,
        octaves: v
      };
      particleSystems.flame.update("noise", newNoise);
    });

  function _onChangeNoiseScale() {
    particleSystems.flame.update(
      "noise.noiseScale",
      flameConf.noise.noiseScale
    );
  }

  const noiseScaleFolder = flameNoiseFolder.addFolder("Scale");
  noiseScaleFolder.close();

  noiseScaleFolder
    .add(flameConf.noise.noiseScale, "x", 0.1, 10, 0.1)
    .name("Noise Scale X")
    .onChange(_onChangeNoiseScale);

  noiseScaleFolder
    .add(flameConf.noise.noiseScale, "y", 0.1, 10, 0.1)
    .name("Noise Scale Y")
    .onChange(_onChangeNoiseScale);

  noiseScaleFolder
    .add(flameConf.noise.noiseScale, "z", 0.1, 10, 0.1)
    .name("Noise Scale Z")
    .onChange(_onChangeNoiseScale);

  noiseScaleFolder
    .add(flameConf.noise.noiseScale, "w", 0.1, 10, 0.1)
    .name("Noise Scale W")
    .onChange(_onChangeNoiseScale);

  // Smoke
  const smokeFolder = particlesFolder.addFolder("Smoke");
  smokeFolder.close();

  smokeFolder
    .add(smokeConf, "area", 0.1, 2, 0.01)
    .name("Area")
    .onChange((v: number) => {
      particleSystems.smoke.update("area", v);
    });

  smokeFolder
    .add(smokeConf, "size", 0.1, 2, 0.01)
    .name("Size")
    .onChange((v: number) => {
      particleSystems.smoke.update("size", v);
    });

  smokeFolder
    .add(smokeConf, "spawnRate", 0.1, 10, 0.1)
    .name("Spawn Rate")
    .onChange((v: number) => {
      particleSystems.smoke.update("spawnRate", v);
    });

  smokeFolder
    .add(smokeConf, "opacity", 0, 1, 0.01)
    .name("Opacity")
    .onChange((v: number) => {
      particleSystems.smoke.update("opacity", v);
    });

  smokeFolder
    .addColor(smokeConf, "color")
    .name("Color")
    .onChange((v: string) => {
      particleSystems.smoke.update("color", v);
    });

  smokeFolder
    .add(smokeConf, "sizeGrowth", 0, 2, 0.01)
    .name("Size Growth")
    .onChange((v: number) => {
      particleSystems.smoke.update("sizeGrowth", v);
    });

  smokeFolder
    .add(smokeConf, "fadeRate", 0.01, 0.5, 0.01)
    .name("Fade Rate")
    .onChange((v: number) => {
      particleSystems.smoke.update("fadeRate", v);
    });

  smokeFolder
    .add(smokeConf, "scaleFactor", 0.5, 5, 0.01)
    .name("Scale Factor")
    .onChange((v: number) => {
      particleSystems.smoke.update("scaleFactor", v);
    });

  // Sparks
  const sparksFolder = particlesFolder.addFolder("Sparks");
  sparksFolder.close();

  sparksFolder
    .addColor(sparkConf, "color")
    .name("Color")
    .onChange((v: string) => {
      particleSystems.sparks.update("color", v);
    });

  sparksFolder
    .add(sparkConf, "area", 0.1, 1, 0.01)
    .name("Area")
    .onChange((v: number) => {
      particleSystems.sparks.update("area", v);
    });

  sparksFolder
    .add(sparkConf, "size", 0.01, 0.5, 0.001)
    .name("Size")
    .onChange((v: number) => {
      particleSystems.sparks.update("size", v);
    });

  sparksFolder
    .add(sparkConf, "spawnRate", 1, 30, 0.1)
    .name("Spawn Rate")
    .onChange((v: number) => {
      particleSystems.sparks.update("spawnRate", v);
    });

  sparksFolder
    .add(sparkConf.sparkProps, "speed", 1, 10, 0.1)
    .name("Speed")
    .onChange((v: number) => {
      particleSystems.sparks.update("sparkProps.speed", v);
    });

  sparksFolder
    .add(sparkConf.sparkProps, "damping", 0.1, 1, 0.01)
    .name("Damping")
    .onChange((v: number) => {
      particleSystems.sparks.update("sparkProps.damping", v);
    });

  sparksFolder
    .add(sparkConf.sparkProps, "stretchFact", 1, 20, 0.1)
    .name("Stretch Factor")
    .onChange((v: number) => {
      particleSystems.sparks.update("sparkProps.stretchFact", v);
    });

  sparksFolder
    .add(sparkConf.sparkProps, "waveAmp", 0, 1, 0.001)
    .name("Wave Amptitude")
    .onChange((v: number) => {
      particleSystems.sparks.update("sparkProps.waveAmp", v);
    });

  sparksFolder
    .add(sparkConf.sparkProps, "waveFreq", 1, 20, 0.5)
    .name("Wave Frequency")
    .onChange((v: number) => {
      particleSystems.sparks.update("sparkProps.waveFreq", v);
    });

  const elevationFolder = sparksFolder.addFolder("Elevation");
  elevationFolder.close();

  elevationFolder
    .add(sparkConf.sparkProps.elevDivs, "min", 1, 15, 0.1)
    .name("Min Elevation")
    .onChange((v: number) => {
      const newElevDivs: minMax = {
        ...sparkConf.sparkProps.elevDivs,
        min: v
      };
      particleSystems.sparks.update("sparkProps.elevDivs", newElevDivs);
    });

  elevationFolder
    .add(sparkConf.sparkProps.elevDivs, "max", 1, 15, 0.1)
    .name("Max Elevation")
    .onChange((v: number) => {
      const newElevDivs: minMax = {
        ...sparkConf.sparkProps.elevDivs,
        max: v
      };
      particleSystems.sparks.update("sparkProps.elevDivs", newElevDivs);
    });
}
