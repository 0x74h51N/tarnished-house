// SPDX-License-Identifier: GPL-3.0-or-later

/**
*
*    Particle vertex shader which takes texture as like smoke.
*    Copyright (C) 2025  Tahsin Önemli
*
*    This program is free software: you can redistribute it and/or modify
*    it under the terms of the GNU General Public License as published by
*    the Free Software Foundation, either version 3 of the License, or
*    (at your option) any later version.
*
*    This program is distributed in the hope that it will be useful,
*    but WITHOUT ANY WARRANTY; without even the implied warranty of
*    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*    GNU General Public License for more details.
*
*    You should have received a copy of the GNU General Public License
*    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*
*/

// Chrome-based browsers may produce visual glitches when using mediump precision in this shader.
precision highp float;

uniform vec2 resolution;
uniform float u_time;
uniform float u_scale;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

in vec3 position;
in vec3 velocity;
in float startTime;
in float size;
in float angle;
in vec4 aColor;
in float sizeGrowth;
in float fadeRate;

out vec4 vColor;
out vec2 vAngle;
out float vFade;
out float vage;

void main()
{
  float age = max(u_time - startTime, 0.0f);
  if (age <= 0.0f)
  {
    gl_Position = vec4(2.0f, 2.0f, 0.0f, 1.0f);
    gl_PointSize = 0.0f;
    return;
  }
  vec3 pos = position + velocity * age;
  vec4 mv = modelViewMatrix * vec4(pos, 1.0f);

  float posDeltaY = pos.y - position.y;

  float grownSize = size + posDeltaY * sizeGrowth;

  gl_Position = projectionMatrix * mv;

  float scale = resolution.y * u_scale;
  gl_PointSize = grownSize * scale / gl_Position.w;

  vAngle = vec2(cos(angle), sin(angle));
  vColor = aColor;
  vFade = fadeRate * posDeltaY;
  vage = age;
}