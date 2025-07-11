#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 resolution;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float u_time;
uniform float u_scale;

uniform float u_damping;  
uniform vec3 u_axisRatio;

attribute vec3 position;
attribute vec3 velocity;
attribute float startTime;
attribute float size;
attribute vec4 colour;
attribute float sizeGrowth;   
attribute float fadeRate;

varying vec4 vColour;
varying float vAngle;
varying float vFade;

void main() {
  float age = max(u_time - startTime, 0.0);
  float t   = age / (1.0 + u_damping * age);

  vec3 offset = velocity * t * u_axisRatio;
  vec3 pos    = position + offset;

  vec4  mv  = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;

  float posDeltaY = pos.y - position.y;

  float grownSize = size + posDeltaY * sizeGrowth;

  
  float scale = resolution.y * u_scale; 
  gl_PointSize = grownSize * scale / gl_Position.w;

  vec3 velView = (modelViewMatrix * vec4(velocity * u_axisRatio, 0.0)).xyz;

  vAngle = atan(velView.y, velView.x);
  vColour = colour;
  vFade = fadeRate * posDeltaY;
}