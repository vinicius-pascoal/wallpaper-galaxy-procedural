#version 300 es
precision mediump float;

in float vBrightness;
in float vSeed;
in float vRotation;
out vec4 outColor;

uniform float uTime;
uniform vec3 uColor0;
uniform vec3 uColor1;
uniform vec3 uColor2;

float rand(vec2 value) {
    return fract(sin(dot(value, vec2(12.9898, 78.233))) * 43758.5453 + vSeed * 19.17);
}

void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float angle = vRotation;
    uv = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * uv;
    float distanceToCenter = length(uv);
    float n = rand(floor((uv + 0.5) * 8.0) + floor(uTime * 0.01));
    float radius = 0.38 + n * 0.12;
    if (distanceToCenter > radius) discard;
    vec3 color = mix(uColor0, uColor1, smoothstep(0.15, 0.72, distanceToCenter + n * 0.12));
    color = mix(color, uColor2, smoothstep(0.32, 0.5, distanceToCenter) * 0.5);
    outColor = vec4(color * vBrightness, 0.72);
}
