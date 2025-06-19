import * as THREE from "three";

// This createParticles function inspired from SimonDevYoutube
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
}`;

const _FS = `

uniform sampler2D diffuseTexture;

varying vec4 vColour;
varying vec2 vAngle;

void main() {
  vec2 coords = (gl_PointCoord - 0.5) * mat2(vAngle.x, vAngle.y, -vAngle.y, vAngle.x) + 0.5;
  gl_FragColor = texture2D(diffuseTexture, coords) * vColour;
}`;

const defaultTexture = new THREE.DataTexture(
  new Uint8Array([255, 255, 255, 255]),
  1,
  1,
  THREE.RGBAFormat
);
defaultTexture.needsUpdate = true;

/**
 * Creates a GPU-accelerated particle system using Three.js.
 * Particles emit around a start position (`startPozs`), move upwards with velocity,
 * and optionally grow or fade as they move. Custom shaders control particle size,
 * rotation, and color tint.
 *
 * @param {Object} options
 * @param {THREE.Object3D} options.parent           – Parent object (scene or group) to attach particles.
 * @param {THREE.Color|number|string} options.color – Base color for particles.
 * @param {number} [options.opacity=1]              – Starting opacity for particles.
 * @param {number} [options.maxCount=200]           – Maximum particle count.
 * @param {number} [options.spawnRate=50]           – Particle spawn rate per second.
 * @param {number} [options.area=1]                 – Spawn area size around start position (X/Z).
 * @param {number} [options.size=0.05]              – Base particle size.
 * @param {Array<number>} [options.startPozs=[0,0,0]] – XYZ coordinates of initial particle spawn center.
 * @param {Array<THREE.Texture>|THREE.Texture|null} [options.textures=null]
 *                                                  – Optional particle textures.
 * @param {Array<THREE.Texture>|THREE.Texture|null} [options.maskTextures=null]
 *                                                  – Optional mask textures (currently unused).
 * @param {THREE.Camera} options.camera             – Camera reference for particle scaling.
 * @param {number} [options.sizeGrowth=0]           – Particle size increase rate with height.
 * @param {number} [options.fadeRate=0]             – Opacity fade rate with height.
 *
 * @returns {Object} Particle system with `.points` (THREE.Points) and `.step(delta)` to update per frame.
 */
export function createParticles({
  parent,
  color,
  opacity = 1,
  maxCount = 200,
  spawnRate = 50,
  area = 1,
  size = 0.05,
  startPozs = [0, 0, 0],
  textures = null,
  maskTextures = null,
  camera,
  sizeGrowth = 0,
  fadeRate = 0,
}) {
  const textureArray = textures
    ? Array.isArray(textures)
      ? textures
      : [textures]
    : [];
  const maskArray = maskTextures
    ? Array.isArray(maskTextures)
      ? maskTextures
      : [maskTextures]
    : textureArray.map(() => defaultTexture);

  const numVariants = Math.max(textureArray.length, maskArray.length, 1);

  const pos = new Float32Array(maxCount * 3);
  const v = new Float32Array(maxCount * 3);
  const variants = new Uint8Array(maxCount);

  const sizeArr = new Float32Array(maxCount);
  const anglesArray = new Float32Array(maxCount);
  const colsArr = new Float32Array(maxCount * 4);
  const baseCol = new THREE.Color(color);

  for (let i = 0; i < maxCount; i++) {
    variants[i] = i % numVariants;
    const i3 = i * 3;

    startPos(startPozs, pos, i3, area);
    startV(v, i3, true);

    sizeArr[i] = size;
    anglesArray[i] = Math.random() * Math.PI * 2;

    colUpt(i, colsArr, baseCol, opacity);
  }

  const pointsArr = [];
  let spawnAccumulator = 0,
    nextIndex = 0;

  for (let v = 0; v < numVariants; v++) {
    const dTex = textureArray[v] || defaultTexture;
    const mTex = maskArray[v] || defaultTexture;
    [mTex, dTex].forEach((t) => {
      t.generateMipmaps = false;
      t.minFilter = THREE.LinearFilter;
      t.magFilter = THREE.LinearFilter;
      t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    });

    const material = new THREE.ShaderMaterial({
      uniforms: {
        pointMultiplier: {
          value: window.innerHeight / Math.tan((camera.fov * Math.PI) / 360),
        },
        diffuseTexture: { value: dTex },
        maskTexture: { value: mTex },
      },
      vertexShader: _VS,
      fragmentShader: _FS,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      alphaTest: 0.01,
      dithering: true,
      vertexColors: true,
    });

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geometry.setAttribute("variant", new THREE.BufferAttribute(variants, 1));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizeArr, 1));
    geometry.setAttribute("angle", new THREE.BufferAttribute(anglesArray, 1));
    geometry.setAttribute("colour", new THREE.BufferAttribute(colsArr, 4));

    const points = new THREE.Points(geometry, material);
    points.renderOrder = 9;
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

      startPos(startPozs, pos, i3, area);
      startV(v, i3);

      variants[i] = i % numVariants;
      nextIndex++;
    }

    for (let i = 0; i < maxCount; i++) {
      const i3 = i * 3;
      pos[i3] += v[i3] * delta;
      pos[i3 + 1] += v[i3 + 1] * delta;
      pos[i3 + 2] += v[i3 + 2] * delta;

      const y = pos[i3 + 1];

      if (sizeGrowth !== 0) sizeArr[i] = size + y * sizeGrowth;

      if (fadeRate !== 0) {
        const newOp = opacity - y * fadeRate;
        colUpt(i, colsArr, baseCol, Math.max(0, newOp));
      }
    }

    for (const p of pointsArr) {
      p.geometry.attributes.position.needsUpdate = true;
      p.geometry.attributes.size.needsUpdate = sizeGrowth !== 0;
      p.geometry.attributes.colour.needsUpdate = fadeRate !== 0;
    }
  }

  return { points: pointsArr, step };
}

function startPos(startPozs = [], pos = [], i3 = 0, area) {
  pos[i3] = startPozs[0] + (Math.random() * 2 - 1) * area;
  pos[i3 + 1] = startPozs[1];
  pos[i3 + 2] = startPozs[2] + (Math.random() * 2 - 1) * area;
}

function startV(v = [], i3 = 0, f = false) {
  v[i3] = f ? 0 : (Math.random() - 0.5) * 0.2;
  v[i3 + 1] = Math.random() * 0.5 + 0.2;
  v[i3 + 2] = f ? 0 : (Math.random() - 0.5) * 0.2;
}

function colUpt(i, colsArr, baseCol, opacity) {
  const i4 = i * 4;
  colsArr[i4] = baseCol.r;
  colsArr[i4 + 1] = baseCol.g;
  colsArr[i4 + 2] = baseCol.b;
  colsArr[i4 + 3] = opacity;
}
