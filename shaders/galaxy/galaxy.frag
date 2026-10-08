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

    float core = step(distanceToCenter, 0.21);
    float alpha = vBrightness * vTwinkle * (0.62 + 0.38 * core);
    vec3 color = starTemperature(vTemperature);
    if (uColorMood > 0.5 && uColorMood < 1.5) color = mix(color, vec3(0.22, 0.54, 1.0), 0.34);
    else if (uColorMood > 1.5 && uColorMood < 2.5) color = mix(color, vec3(0.92, 0.22, 0.12), 0.28);
    else if (uColorMood > 2.5 && uColorMood < 3.5) color = mix(color, vec3(0.52, 0.82, 1.0), 0.30);
    else if (uColorMood > 3.5 && uColorMood < 4.5) color = mix(color, vec3(0.72, 0.34, 0.14), 0.25);
    else if (uColorMood > 5.5 && uColorMood < 6.5) color = mix(color, vec3(0.36, 0.12, 0.08), 0.2);
    else if (uColorMood > 6.5 && uColorMood < 7.5) color *= 0.58;
    outColor = vec4(color, alpha);
}
