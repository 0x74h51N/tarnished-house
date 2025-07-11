#ifdef GL_ES
precision mediump float;    
#endif

varying vec2  vRot; 
varying vec4  vColour;
varying float vSpeedRatio;
uniform float u_stretch;

void main(){
  vec2 local = gl_PointCoord - 0.5;

  mat2 R = mat2( vRot.x, -vRot.y,
                       vRot.y,  vRot.x );
  vec2 rotLoc = R * local;

  float stretch = mix(0.4, u_stretch, vSpeedRatio);
  rotLoc.y *= stretch;

  float d = length(rotLoc);

  float t = clamp(d*2.0, 0.0, 1.0);
  
  float strength = 1.0 - (t * t * (3.0 - 2.0 * t));

  float bboost  = u_stretch * 0.5 - 1.0;
  
  strength *= 1.0 + bboost * vSpeedRatio;

  vec4  col = vColour * strength;
  col.a = strength;

  col.a = max(col.a, 0.005);
  gl_FragColor  = col;
}