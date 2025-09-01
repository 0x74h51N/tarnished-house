// SPDX-License-Identifier: GPL-3.0-or-later

/**
*
*    Particle fragment shader which takes texture as like smoke.
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

uniform sampler2D diffuseTexture;

in vec4 vColor;
in vec2 vAngle;
in float vFade;
in float vage;
out vec4 fragColor;

void main () {
    if (vage <= 0.0f)
        discard;

    vec2 coords = (gl_PointCoord - 0.5f) * mat2 (vAngle.x, vAngle.y, - vAngle.y, vAngle.x) + 0.5f;

    vec4 col = texture (diffuseTexture, coords) * vColor;
    float fade = clamp (1.0f - vFade, 0.0f, 1.0f);

    col.rgb *= fade;
    col.a *= fade;

    col.a = max (col.a, 0.005f);

    fragColor = col;
}
