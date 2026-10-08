#version 300 es
precision mediump float;

uniform vec3 uColor;
out vec4 outColor;

void main() {
    vec2 centered = gl_PointCoord - 0.5;
    if (max(abs(centered.x), abs(centered.y)) > 0.5) discard;
    outColor = vec4(uColor, 0.82);
}
