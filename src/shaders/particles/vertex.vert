#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 resolution;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float u_time;
uniform float u_scale;

attribute vec3 position;
attribute vec3 velocity;
attribute float startTime;
attribute float size;
attribute float angle;
attribute vec4 colour;
attribute float sizeGrowth;   
attribute float fadeRate;

varying vec4 vColour;
varying vec2 vAngle;
varying float vFade;

void main() {
  float age = max(u_time - startTime, 0.0);

  vec3  pos = position + velocity * age;
  vec4  mv  = modelViewMatrix * vec4(pos, 1.0);
  
  float posDeltaY = pos.y - position.y;

  float grownSize = size + posDeltaY * sizeGrowth;

  gl_Position = projectionMatrix * mv;
  
  float scale = resolution.y * u_scale; 
  gl_PointSize = grownSize * scale / gl_Position.w;

  vAngle  = vec2(cos(angle), sin(angle));
  vColour = colour;
  vFade = fadeRate * posDeltaY;
}