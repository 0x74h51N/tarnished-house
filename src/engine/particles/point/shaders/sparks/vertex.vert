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
  float age = max(u_time - startTime, 0.0);
  float invDen = 1.0 / (1.0 + u_damping * age);
  float t = age * invDen;

  vec3 axisVel = velocity * u_axisRatio;
  vec3 dampedVel = axisVel * invDen;
  vec3 offset = axisVel * t;
  float traveled = length(offset);

  vec3 worldPos = position + offset;
  vec4 mv = modelViewMatrix * vec4(worldPos, 1.0);
  vec4 clip = projectionMatrix  * mv;

  // compute billboard rotation
  vec3 velView = (modelViewMatrix * vec4(axisVel, 0.0)).xyz;
  float angle = atan(velView.y, velView.x);
  vRot = vec2(cos(-angle), sin(-angle));

  vColour = colour;
  vSpeedRatio = clamp(length(dampedVel) / length(axisVel), 0.0, 1.0);

  // apply sinus wave offset in clip space
  vec2 perp = vec2(-vRot.y, vRot.x);
  float amp = u_wave_amp * vSpeedRatio;
  float wave = sin(traveled * u_wave_freq) * amp;
  
  clip.xy += perp * wave * clip.w;

  gl_Position = clip;
  gl_PointSize = (size * resolution.y * u_scale / gl_Position.w) * vSpeedRatio;
}
