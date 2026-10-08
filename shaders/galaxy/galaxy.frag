#version 300 es
precision mediump float;

#include "../common/palette.glsl"

in float vBrightness;
in float vTemperature;
in float vTwinkle;
out vec4 outColor;

void main() {
    vec2 centered = gl_PointCoord - 0.5;
    float distanceToCenter = max(abs(centered.x), abs(centered.y));
    if (distanceToCenter > 0.5) {
        discard;
    }

    float core = step(distanceToCenter, 0.21);
    float alpha = vBrightness * vTwinkle * (0.62 + 0.38 * core);
    vec3 color = starTemperature(vTemperature);
    outColor = vec4(color, alpha);
}
