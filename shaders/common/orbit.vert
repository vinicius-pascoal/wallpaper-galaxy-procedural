#version 300 es
precision highp float;

layout(location = 0) in vec2 aPosition;
uniform float uAspect;
uniform float uDepth;
uniform vec2 uCameraOffset;

void main() {
    vec2 position = aPosition + vec2(uCameraOffset.x / uAspect, uCameraOffset.y) * uDepth;
    gl_Position = vec4(position, 0.0, 1.0);
}
