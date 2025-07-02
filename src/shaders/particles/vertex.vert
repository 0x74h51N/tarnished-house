#ifdef GL_ES
precision highp float;
#endif

uniform float pointMultiplier;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float u_time;
    
attribute float size;
attribute float angle;
attribute vec4 colour;
attribute vec3 position;

varying vec4 vColour;
varying vec2 vAngle;



void main() {
 
  float offset = sin(u_time * 4.0 + position.x * 50.0) * 0.05;
  vec4 newPosition = vec4(position + vec3(0.0, offset, 0.0), 1.0);

  gl_Position = projectionMatrix * modelViewMatrix * newPosition;
  gl_PointSize = size * pointMultiplier / gl_Position.w;

  vAngle = vec2(cos(angle), sin(angle));
  vColour = colour;
}