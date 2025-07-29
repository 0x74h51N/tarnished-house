
precision mediump float;

uniform sampler2D diffuseTexture;

in vec4 vColour;
in vec2 vAngle;
in float vFade;

out vec4 fragColor;

void main() {
vec2 coords = (gl_PointCoord - 0.5) * mat2(vAngle.x, vAngle.y, -vAngle.y, vAngle.x) + 0.5;

vec4 col = texture(diffuseTexture, coords) * vColour;

float fade = clamp(1.0 - vFade, 0.0, 1.0);

col.rgb *= fade;    
col.a   *= fade;   

col.a = max(col.a, 0.005);

fragColor = col;
}
