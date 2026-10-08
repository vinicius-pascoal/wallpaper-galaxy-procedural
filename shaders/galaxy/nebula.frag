#version 300 es
precision highp float;

#include "../common/noise.glsl"
#include "../common/fbm.glsl"
#include "../common/rotate.glsl"
#include "../common/palette.glsl"

in vec2 vUv;
out vec4 outColor;

const int MAX_NEBULAE = 4;
uniform float uTime;
uniform float uAspect;
uniform vec2 uCameraOffset;
uniform int uNebulaCount;
uniform vec2 uCenters[MAX_NEBULAE];
uniform vec2 uScales[MAX_NEBULAE];
uniform float uRotations[MAX_NEBULAE];
uniform float uThresholds[MAX_NEBULAE];
uniform float uSoftness[MAX_NEBULAE];
uniform float uWarpStrength[MAX_NEBULAE];
uniform float uBrightness[MAX_NEBULAE];
uniform float uOpacity[MAX_NEBULAE];
uniform float uSpeeds[MAX_NEBULAE];
uniform vec2 uSeedOffsets[MAX_NEBULAE];
uniform vec3 uColorA[MAX_NEBULAE];
uniform vec3 uColorB[MAX_NEBULAE];
uniform vec3 uColorC[MAX_NEBULAE];

void main() {
    vec2 world = vec2((vUv.x - 0.5) * 2.0 * uAspect, (vUv.y - 0.5) * 2.0);
    vec3 accumulated = vec3(0.0);
    float accumulatedAlpha = 0.0;

    for (int index = 0; index < MAX_NEBULAE; index += 1) {
        if (index >= uNebulaCount) {
            break;
        }

        vec2 local = world - uCenters[index] - uCameraOffset * 0.16;
        local = rotate2d(local, -uRotations[index]);
        local /= uScales[index];
        float shape = 1.0 - smoothstep(0.42, 1.25, length(local * vec2(0.82, 1.12)));
        vec2 evolvingUv = local * 1.55 + uSeedOffsets[index] + vec2(uTime * uSpeeds[index], -uTime * uSpeeds[index] * 0.63);

        float baseNoise = fbm(evolvingUv * 1.25, 3);
        vec2 warp = vec2(
            fbm(evolvingUv * 1.72 + vec2(2.3, 7.1), 2),
            fbm(evolvingUv * 1.91 + vec2(8.7, 1.4), 2)
        );
        float filamentNoise = fbm(evolvingUv * 1.72 + warp * uWarpStrength[index] * 2.3, 3);
        float cloud = mix(baseNoise, filamentNoise, 0.76);
        float density = smoothstep(uThresholds[index], uThresholds[index] + uSoftness[index], cloud) * shape;
        float wisps = smoothstep(0.34, 0.78, fbm(evolvingUv * 3.2 + warp * 1.6, 2));
        density *= 0.74 + wisps * 0.52;

        vec3 palette = mix(uColorA[index], uColorB[index], smoothstep(0.36, 0.7, cloud));
        palette = mix(palette, uColorC[index], smoothstep(0.63, 0.96, cloud));
        float alpha = density * uOpacity[index] * uBrightness[index];
        accumulated += palette * alpha;
        accumulatedAlpha = 1.0 - (1.0 - accumulatedAlpha) * (1.0 - alpha);
    }

    outColor = vec4(accumulated, clamp(accumulatedAlpha, 0.0, 0.78));
}
