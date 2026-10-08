#version 300 es
precision highp float;

layout(location = 0) in vec2 aPosition;
uniform vec2 uCenter;
uniform float uAspect;
uniform float uRadius;
uniform float uInternalHeight;
uniform float uDepth;
uniform vec2 uCameraOffset;

void main() {
    vec2 position = uCenter + uCameraOffset * uDepth;
    gl_Position = vec4(position.x / uAspect, position.y, 0.0, 1.0);
    gl_PointSize = max(1.0, uRadius * uInternalHeight * 2.0);
}
