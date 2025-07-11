#ifdef GL_ES
precision mediump float;
#endif

varying float vAngle;
varying vec4 vColour;
varying float vFade;
varying float vSpeed;
varying float vInitSpeed;

uniform float u_stretch;

void main() {
  vec2 local = gl_PointCoord - 0.5;
  float c = cos(-vAngle), s = sin(-vAngle);
  mat2 rot = mat2(c, -s, s, c);
  vec2 rotated = rot * local;

  float speedRatio = clamp(vSpeed / vInitSpeed, 0.0, 1.0);

  float stretch = mix(0.4, u_stretch, speedRatio);
  rotated.y *= stretch;

  vec2 coords = rotated + 0.5;
  float d = length(coords - 0.5);
  float strength = 1.0 - smoothstep(0.0, 0.5, d);

  strength *= mix(1.0, u_stretch / 2.0,  speedRatio);
 
  vec4 col = vColour;
  float fade = clamp(1.0 - vFade, 0.0, 1.0);
  col.rgb *= strength * fade;
  col.a   = strength * fade;

  if(col.a < 0.005) discard;
  gl_FragColor = col;
}
