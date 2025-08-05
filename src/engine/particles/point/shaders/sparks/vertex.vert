// SPDX-License-Identifier: GPL-3.0-or-later

/*
 *
 * Vertex shader for spark particles: applies time-based damping,
 * billboard alignment, and distance-based sinusoidal offset along
 * a perpendicular axis for dynamic wave motion.
 *
 * Copyright (C) 2025 Tahsin Önemli
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */


uniform vec2  resolution;
uniform float u_time;
uniform float u_scale;

uniform float u_damping;    
uniform vec3  u_axisRatio;
uniform float u_wave_amp;
uniform float u_wave_freq;

in vec3   velocity;
in float  startTime;
in float  size;
in vec4   colour;

out vec4  vColour;
out vec2  vRot;
out float vSpeedRatio;

void main() {
  // ---- Damping -----
  float age    = max(u_time - startTime, 0.0);
  float invDen = 1.0 / (1.0 + u_damping * age);
  float t      = age * invDen;

  // ---- Base motion ----
  vec3 axisVel   = velocity * u_axisRatio;
  vec3 dampedVel = axisVel * invDen;
  vec3 offset    = axisVel * t;
  float traveled = length(offset);
  float speed    = length(dampedVel);
  float phase    = traveled * u_wave_freq;
  
  vSpeedRatio    = clamp(speed/ length(axisVel), 0.0, 1.0);
  float amp      = u_wave_amp * vSpeedRatio;

  // ---- Sin-wave offset in world position ----
  vec3 dirNorm   = normalize(axisVel);
  vec3 perpWorld = normalize(cross(dirNorm, vec3(0.0,1.0,0.0)));
  vec3 wave      = perpWorld * (sin(phase) * amp);

  // ---- World & clip position ----
  vec3 worldPos = position + offset + wave;
  vec4 mv       = modelViewMatrix * vec4(worldPos, 1.0);
  vec4 clip     = projectionMatrix  * mv ;

  // ---- Velocity direction angle (for vRot) ----
  float dWave_dt = amp * cos(phase) * u_wave_freq * speed;
  vec3 totalVel = dampedVel + perpWorld * dWave_dt;

  vec4 velClip = projectionMatrix * modelViewMatrix * vec4(totalVel, 0.0);
  vec2 velDir  = normalize(velClip.xy);
  float angle  = atan(velDir.y, velDir.x);

  vRot         = vec2(cos(-angle), sin(-angle));
  vColour      = colour;
  gl_Position  = clip;
  gl_PointSize = (size * resolution.y * u_scale / clip.w) * vSpeedRatio;
}