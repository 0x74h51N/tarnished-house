// SPDX-License-Identifier: GPL-3.0-or-later

/*
 *
 * Fragment shader for spark particles: applies directional stretch,
 * speed-based brightness boost, and smooth falloff for glowing effect.
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


precision highp float;

in vec2  vRot; 
in vec4  vColor;
in float vSpeedRatio;
uniform float u_stretch;

out vec4 fragColor;

void main() {
  // ---- Transform point coord to rotated local space ----
  vec2 local  = gl_PointCoord - 0.5;
  mat2 R      = mat2(vRot.x, -vRot.y,
                     vRot.y,  vRot.x);
  vec2 rotLoc = R * local;

  // ---- Speed proportional stretch ----
  float stretch = mix(0.0, u_stretch, vSpeedRatio);
  rotLoc.y     *= stretch;

  // Radial falloff
  float d       = length(rotLoc);
  float t       = clamp(d * 2.0, 0.0, 1.0);
  float strength = 1.0 - smoothstep(0.0, 1.0, t); // Radial fade-out

  // Brightness boost based on stretch factor
  float bboost  = u_stretch * 0.5 - 1.0;
  strength     *= 1.0 + bboost * vSpeedRatio;

  vec4 col     = vColor * strength;
  col.a        = max(strength, 0.005);

  fragColor    = col;
}
