/*
  Volumetric fire shader (modified)

  Original: "Ray tracing based real-time procedural volumetric fire shader"
  Author: mattatz (http://mattatz.github.io)
  License: MIT (see LICENSE or THIRD_PARTY_LICENSES.md)
  https://github.com/mattatz/THREE.Fire/blob/master/FireShader.js

  Includes simplex noise from Ashima Arts (MIT)
  Author : Ian McEwan, Ashima Arts.
  Maintainer : stegu
  https://github.com/ashima/webgl-noise/blob/master/src/noise3D.glsl

  Changes by <Tahsin Önemli>, 2025-07-22:
  - Ported to GLSL ES 3.00
  - Added edge masking & turbulence tweaks
  - Uniform refactor (u_radius, u_height, etc.) and color mix
*/

precision highp float;
precision highp int;

uniform float u_time;
uniform float seed;
uniform mat4 invModelMatrix;
uniform vec3 scale;
uniform vec4 noiseScale;
uniform float magnitude;
uniform float lacunarity;
uniform float gain;
uniform sampler2D diffText;
uniform float u_radius;
uniform float u_height;
uniform float u_bottom;
uniform vec3 cameraPosition;

uniform int u_iterations;
uniform int u_octaves;

in vec3 vWorldPos;
out vec4 fragColor;

uniform vec3 color;
uniform float colorMixStrength;

// ------------------------------------------------------------
// GLSL simplex noise function by ashima
// -------- simplex noise
// ------------------------------------------------------------
vec3 mod289 (vec3 x) {
    return x - floor (x * (1.0f / 289.0f)) * 289.0f;
}
vec4 mod289 (vec4 x) {
    return x - floor (x * (1.0f / 289.0f)) * 289.0f;
}
vec4 permute (vec4 x) {
    return mod289 (((x * 34.0f) + 1.0f) * x);
}
vec4 taylorInvSqrt (vec4 r) {
    return 1.79284291400159f - 0.85373472095314f * r;
}

float snoise (vec3 v) {
    const vec2 C = vec2 (1.0f / 6.0f, 1.0f / 3.0f);
    const vec4 D = vec4 (0.0f, 0.5f, 1.0f, 2.0f);

    vec3 i = floor (v + dot (v, C.yyy));
    vec3 x0 = v - i + dot (i, C.xxx);

    vec3 g = step (x0.yzx, x0.xyz);
    vec3 l = 1.0f - g;
    vec3 i1 = min (g.xyz, l.zxy);
    vec3 i2 = max (g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;   // 2.0*C.x = 1/3 = C.y
    vec3 x3 = x0 - D.yyy;        // -1.0+3.0*C.x = -0.5 = -D.y

    i = mod289 (i);
    vec4 p = permute (permute (permute (i.z + vec4 (0.0f, i1.z, i2.z, 1.0f)) + i.y + vec4 (0.0f, i1.y, i2.y, 1.0f)) + i.x + vec4 (0.0f, i1.x, i2.x, 1.0f));

    float n_ = 0.142857142857f; // 1/7
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0f * floor (p * ns.z * ns.z);  // mod(p, 7*7)
    vec4 x_ = floor (j * ns.z);
    vec4 y_ = floor (j - 7.0f * x_);                // mod(j, N)

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0f - abs (x) - abs (y);

    vec4 b0 = vec4 (x.xy, y.xy);
    vec4 b1 = vec4 (x.zw, y.zw);

    vec4 s0 = floor (b0) * 2.0f + 1.0f;
    vec4 s1 = floor (b1) * 2.0f + 1.0f;
    vec4 sh = - step (h, vec4 (0.0f));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 p0 = vec3 (a0.xy, h.x);
    vec3 p1 = vec3 (a0.zw, h.y);
    vec3 p2 = vec3 (a1.xy, h.z);
    vec3 p3 = vec3 (a1.zw, h.w);

    // Normalize
    vec4 norm = taylorInvSqrt (vec4 (dot (p0, p0), dot (p1, p1), dot (p2, p2), dot (p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    // Final mix
    vec4 m = max (0.6f - vec4 (dot (x0, x0), dot (x1, x1), dot (x2, x2), dot (x3, x3)), 0.0f);
    m *= m;

    return 42.0f * dot (m * m, vec4 (dot (p0, x0), dot (p1, x1), dot (p2, x2), dot (p3, x3)));
}

// ------------------------------------------------------------
float turbulence (vec3 p) {
    float sum = 0.0f;
    float freq = 1.0f;
    float amp = 1.0f;
    for (int i = 0; i < u_octaves; ++ i) {
        sum += abs (snoise (p * freq)) * amp;
        freq *= lacunarity;
        amp *= gain;
    }
    return sum;
}

vec4 samplerFire (vec3 p, vec4 scale4) {
    float r = length (p.xz) / u_radius;
    float y = (p.y - u_bottom) / u_height;

    float edge = 1.0f * (1.0f - smoothstep (0.98f, 1.0f, r)) * smoothstep (0.0f, 0.02f, y) * (1.0f - smoothstep (0.98f, 1.0f, y));

    if (edge <= 0.0f)
        return vec4 (0.0f);

    p.y -= (seed + u_time) * scale4.w;
    p *= scale4.xyz;

    y += sqrt (y) * magnitude * turbulence (p);
    if (y <= 0.0f || y >= 1.0f)
        return vec4 (0.0f);

    vec4 tex = texture (diffText, vec2 (r, y));
    return tex * edge;
}

vec3 localize (vec3 p) {
    return (invModelMatrix * vec4 (p, 1.0f)).xyz;
}

// ------------------------------------------------------------
void main () {
    vec3 rayPos = vWorldPos;
    vec3 rayDir = normalize (rayPos - cameraPosition);
    float rayLen = 0.0288f * length (scale);

    vec4 col = vec4 (0.0f);

    for (int i = 0; i < u_iterations; ++ i) {
        rayPos += rayDir * rayLen;

        vec3 lp = localize (rayPos);
        lp.y -= 0.8f;
        lp.xz *= 2.0f;

        col += samplerFire (lp, noiseScale);
    }

    col.a = col.r;

    float mask = step (0.001f, col.r);
    col.rgb = mix (col.rgb, color, colorMixStrength * mask);

    fragColor = col;
}
