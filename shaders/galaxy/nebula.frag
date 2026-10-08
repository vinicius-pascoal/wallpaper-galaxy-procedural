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
uniform float uEventPulse;
uniform float uIntensity;
uniform float uAudioBoost;
uniform float uColorMood;

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
        float alpha = density * uOpacity[index] * uBrightness[index] * uIntensity * (1.0 + uEventPulse + uAudioBoost * 0.12);
        accumulated += palette * alpha;
        accumulatedAlpha = 1.0 - (1.0 - accumulatedAlpha) * (1.0 - alpha);
    }

    outColor = vec4(accumulated, clamp(accumulatedAlpha, 0.0, 0.78));
    if (uColorMood > 0.5 && uColorMood < 1.5) outColor.rgb = mix(outColor.rgb, vec3(0.16, 0.42, 1.0), 0.25);
    else if (uColorMood > 1.5 && uColorMood < 2.5) outColor.rgb = mix(outColor.rgb, vec3(0.82, 0.12, 0.08), 0.22);
    else if (uColorMood > 2.5 && uColorMood < 3.5) outColor.rgb = mix(outColor.rgb, vec3(0.44, 0.78, 1.0), 0.24);
    else if (uColorMood > 3.5 && uColorMood < 4.5) outColor.rgb = mix(outColor.rgb, vec3(0.62, 0.28, 0.12), 0.2);
    else if (uColorMood > 6.5 && uColorMood < 7.5) outColor.rgb *= 0.58;
}
