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

varying vec4 vColour;
varying vec2 vRot;
varying float vSpeedRatio;

void main() {
  float age = max(u_time - startTime, 0.0);
  
  float denom = 1.0 + u_damping * age;
  
  float invDen = 1.0 / denom;
  
  float t = age * invDen;
  
  vec3 axisVel = velocity * u_axisRatio;

  vec3 dampedVel = axisVel * invDen;
  
  vec3 offset = axisVel * t;
  
  vec3 pos = position + offset;

  vec4  mv  = modelViewMatrix * vec4(pos, 1.0);

  gl_Position = projectionMatrix * mv;

  float scale = resolution.y * u_scale; 

  vec3 velView = (modelViewMatrix * vec4(velocity * u_axisRatio, 0.0)).xyz;

  float angle = atan(velView.y, velView.x);
  
  vRot = vec2(cos(-angle), sin(-angle));

  vColour = colour;
  
  float vInit = length(axisVel);
  
  vSpeedRatio = clamp(length(dampedVel) / vInit, 0.0, 1.0);
  
  gl_PointSize = (size * scale / gl_Position.w) * vSpeedRatio;
}