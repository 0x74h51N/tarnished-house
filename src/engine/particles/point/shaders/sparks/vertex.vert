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
  
  float traveled = length(offset);                   // Magnitude of traveled from origin aka Euclidean distance
  float speed    = length(dampedVel);                // Damped instantaneous speed, magnitude of velocity
  float iSpeed   = length(axisVel);                  // Initial speed                

  vSpeedRatio    = clamp(speed/ iSpeed, 0.0, 1.0);


  // ---- Sin-wave offset in world position ----
  float phase    = u_wave_freq * traveled;
  float amp      = u_wave_amp * vSpeedRatio;

  vec3 dirNorm   = axisVel / iSpeed;               // Normalize - pure direction, no magnitude
  vec3 perp      = cross(dirNorm, vec3(0.0,1.0,0.0)); // Perpendicular to motion direction, on horizontal plane (Y-up)
  vec3 perpWorld = normalize(perp);                   // Normalize - pure direction, no magnitude
  vec3 wave      = perpWorld * (sin(phase) * amp);    // Sinusoidal offset on the perpendicular


  // ---- World & clip position ----
  mat4 viewProj = projectionMatrix * modelViewMatrix;
  vec3 worldPos = position + offset + wave;
  vec4 clip     = viewProj * vec4(worldPos, 1.0);

  // ---- Velocity direction angle (for vRot) ----
  float dWave_dt = amp            // Deritative of sin wave in time (scalar speed of wave)
                  * cos(phase)      // d/dt[ perpWorld * (sin(phase) * amp) ] = cos(phase) * dPhase/dt
                  * u_wave_freq     // dPhase/dt = u_wave_freq * d(traveled)/dt
                  * speed;          // d(traveled)/dt ~= speed

  vec3 totalVel = dampedVel + perpWorld * dWave_dt;    // Forward + oscillation 

  vec4 velClip = viewProj * vec4(totalVel, 0.0);       // Velocity direction transformed to clip space
  vec2 velDir  = normalize(velClip.xy);                     
  float angle  = atan(velDir.y, velDir.x);             // Radian angle from X axis in 2D

  vRot         = vec2(cos(-angle), sin(-angle));      
  vColour      = colour;
  gl_Position  = clip;
  gl_PointSize = (size * resolution.y * u_scale / clip.w) * vSpeedRatio;
}