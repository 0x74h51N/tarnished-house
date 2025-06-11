import * as THREE from "three";

// this createSimpleParticles function inspired from SimonDevYoutube
// https://github.com/simondevyoutube/ThreeJS_Tutorial_ParticleSystems/blob/master/main.js
// VertexShader and FragmentShader directly copied from that repo.

const _VS = `  
uniform float pointMultiplier;
attribute float size;
attribute float angle;
attribute vec4 colour;
varying vec4 vColour;
varying vec2 vAngle;
void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = size * pointMultiplier / gl_Position.w;
  vAngle = vec2(cos(angle), sin(angle));
  vColour = colour;
}
`;

const _FS = `
uniform sampler2D diffuseTexture;
varying vec4 vColour;
varying vec2 vAngle;
void main() {
  vec2 coords = (gl_PointCoord - 0.5) 
    * mat2(vAngle.x, vAngle.y, -vAngle.y, vAngle.x) + 0.5;
  gl_FragColor = texture2D(diffuseTexture, coords) * vColour;
}
`;

const defaultTexture = new THREE.DataTexture(
  new Uint8Array([255, 255, 255, 255]),
  1,
  1,
  THREE.RGBAFormat
);
defaultTexture.needsUpdate = true;

/**
 * Creates and manages a simple GPU‐accelerated particle system.
 * Particles are emitted from a box area around yStart, move with velocity,
 * and fade out over their lifetime. Uses custom shaders for size, rotation,
 * and color tinting.
 *
 * @param {Object} options
 * @param {THREE.Object3D} options.parent    – Three.js scene or group to attach the particle Points.
 * @param {THREE.Color|number|string} options.color    – Base tint color for all particles.
 * @param {number} [options.opacity=1]      - Default 1
 * @param {number} [options.maxCount=200]   – Max number of particles to allocate.
 * @param {number} [options.spawnRate=50]   – How many particles spawn per second.
 * @param {number} [options.area=1]         – Half‐width of the spawning box (x/z direction).
 * @param {number} [options.size=0.05]      – Base size of each particle (in world units).
 * @param {number} [options.yStart=0]       – Y‐coordinate where new particles appear.
 * @param {Array<THREE.Texture>|THREE.Texture|null} [options.textures=null]
 *                                           – Optional array of textures to randomly assign.
 * @param {THREE.Camera} options.camera    – Camera used to compute size attenuation.
 *
 * @returns {Object} controller with `.start()` and `.stop()` methods to control emission.
 */
export function createSimpleParticles({
  parent,
  color,
  opacity = 1,
  maxCount = 200,
  spawnRate = 50,
  area = 1,
  size = 0.05,
  yStart = 0,
  textures = null,
  camera,
}) {
  const textureArray = textures
    ? Array.isArray(textures)
      ? textures
      : [textures]
    : [];
  const numVariants = textureArray.length || 1;

  const positions = new Float32Array(maxCount * 3);
  const velocities = new Float32Array(maxCount * 3);
  const variants = new Uint8Array(maxCount);

  const sizesArray = new Float32Array(maxCount);
  const anglesArray = new Float32Array(maxCount);
  const coloursArray = new Float32Array(maxCount * 4);
  const baseCol = new THREE.Color(color);

  for (let i = 0; i < maxCount; i++) {
    variants[i] = i % numVariants;
    const i3 = i * 3;
    positions[i3 + 0] = (Math.random() * 2 - 1) * area;
    positions[i3 + 1] = yStart;
    positions[i3 + 2] = (Math.random() * 2 - 1) * area;
    velocities[i3 + 0] = 0;
    velocities[i3 + 1] = Math.random() * 0.5 + 0.2;
    velocities[i3 + 2] = 0;

    sizesArray[i] = size;
    anglesArray[i] = Math.random() * Math.PI * 2;
    coloursArray[i * 4 + 0] = baseCol.r;
    coloursArray[i * 4 + 1] = baseCol.g;
    coloursArray[i * 4 + 2] = baseCol.b;
    coloursArray[i * 4 + 3] = opacity;
  }

  const pointsArr = [];
  let spawnAccumulator = 0,
    nextIndex = 0;

  for (let v = 0; v < numVariants; v++) {
    const diffuseTex = textureArray[v] || defaultTexture;

    const material = new THREE.ShaderMaterial({
      uniforms: {
        pointMultiplier: {
          value: window.innerHeight / Math.tan((camera.fov * Math.PI) / 360),
        },
        diffuseTexture: { value: diffuseTex },
      },
      vertexShader: _VS,
      fragmentShader: _FS,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("velocity", new THREE.BufferAttribute(velocities, 3));
    geometry.setAttribute("variant", new THREE.BufferAttribute(variants, 1));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizesArray, 1));
    geometry.setAttribute("angle", new THREE.BufferAttribute(anglesArray, 1));
    geometry.setAttribute("colour", new THREE.BufferAttribute(coloursArray, 4));

    const points = new THREE.Points(geometry, material);
    parent.add(points);
    pointsArr.push(points);
  }

  function step(delta) {
    spawnAccumulator += delta * spawnRate;
    const toSpawn = Math.floor(spawnAccumulator);
    spawnAccumulator -= toSpawn;

    for (let s = 0; s < toSpawn; s++) {
      const i = nextIndex % maxCount;
      const i3 = i * 3;
      positions[i3 + 0] = (Math.random() * 2 - 1) * area;
      positions[i3 + 1] = yStart;
      positions[i3 + 2] = (Math.random() * 2 - 1) * area;
      velocities[i3 + 0] = (Math.random() - 0.5) * 0.2;
      velocities[i3 + 1] = Math.random() * 0.5 + 0.2;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.2;
      variants[i] = i % numVariants;
      nextIndex++;
    }

    for (let i = 0; i < maxCount; i++) {
      const i3 = i * 3;
      positions[i3 + 0] += velocities[i3 + 0] * delta;
      positions[i3 + 1] += velocities[i3 + 1] * delta;
      positions[i3 + 2] += velocities[i3 + 2] * delta;
    }

    for (const p of pointsArr) {
      p.geometry.attributes.position.needsUpdate = true;
    }
  }

  return { points: pointsArr, step };
}
