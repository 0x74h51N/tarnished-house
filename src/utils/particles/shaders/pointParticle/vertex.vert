precision mediump float;

uniform vec2 resolution;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float u_time;
uniform float u_scale;

in vec3 position;
in vec3 velocity;
in float startTime;
in float size;
in float angle;
in vec4 colour;
in float sizeGrowth;   
in float fadeRate;

out vec4 vColour;
out vec2 vAngle;
out float vFade;

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