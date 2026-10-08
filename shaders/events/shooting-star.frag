#version 300 es
precision mediump float;

in float vAlpha;
in vec3 vColor;
out vec4 outColor;

void main() {
    outColor = vec4(vColor, vAlpha);
}
