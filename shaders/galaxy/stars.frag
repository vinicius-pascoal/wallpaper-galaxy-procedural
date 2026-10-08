#version 300 es
precision mediump float;

#include "../common/palette.glsl"

in float vBrightness;
in float vTemperature;
in float vTwinkle;
uniform float uColorMood;
out vec4 outColor;

void main() {
    vec2 centered = gl_PointCoord - 0.5;
    float distanceToCenter = max(abs(centered.x), abs(centered.y));
    if (distanceToCenter > 0.5) {
        discard;
    }

    float core = step(distanceToCenter, 0.23);
    float alpha = vBrightness * vTwinkle * (0.66 + 0.34 * core);
    vec3 color = starTemperature(vTemperature);
    if (uColorMood > 0.5 && uColorMood < 1.5) color = mix(color, vec3(0.22, 0.54, 1.0), 0.30);
    else if (uColorMood > 1.5 && uColorMood < 2.5) color = mix(color, vec3(0.92, 0.22, 0.12), 0.24);
    else if (uColorMood > 2.5 && uColorMood < 3.5) color = mix(color, vec3(0.58, 0.86, 1.0), 0.28);
    else if (uColorMood > 3.5 && uColorMood < 4.5) color = mix(color, vec3(0.72, 0.34, 0.14), 0.22);
    else if (uColorMood > 6.5 && uColorMood < 7.5) color *= 0.58;
    outColor = vec4(color, alpha);
}
