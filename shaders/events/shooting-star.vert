#version 300 es
precision highp float;

layout(location = 0) in vec2 aPosition;
layout(location = 1) in float aAlpha;
layout(location = 2) in vec3 aColor;
uniform float uAspect;
uniform vec2 uCameraOffset;
out float vAlpha;
out vec3 vColor;

void main() {
    gl_Position = vec4((aPosition.x + uCameraOffset.x * 0.02) / uAspect, aPosition.y + uCameraOffset.y * 0.02, 0.0, 1.0);
    vAlpha = aAlpha;
    vColor = aColor;
}
