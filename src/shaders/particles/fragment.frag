#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D diffuseTexture;

varying vec4 vColour;
varying vec2 vAngle;
varying float vFade;

void main() {
vec2 coords = (gl_PointCoord - 0.5) * mat2(vAngle.x, vAngle.y, -vAngle.y, vAngle.x) + 0.5;

vec4 col = texture2D(diffuseTexture, coords) * vColour;

float fade = clamp(1.0 - vFade, 0.0, 1.0);

col.rgb *= fade;    
col.a   *= fade;   

if(col.a < 0.005) discard; 

gl_FragColor = col;
}
