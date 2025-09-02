precision mediump float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 modelMatrix;

in vec3 position;

out vec3 vWorldPos;

void main()
{
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0f);

    vWorldPos = (modelMatrix * vec4(position, 1.0f)).xyz;
}
