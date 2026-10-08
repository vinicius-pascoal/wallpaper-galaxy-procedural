#version 300 es
precision highp float;

#include "../common/pixelplanets.glsl"

in vec2 vUv;
out vec4 outColor;

uniform float uTime;
uniform float uTimeSpeed;
uniform float uAspect;
uniform float uPixels;
uniform float uLayerRadius;
uniform float uDepth;
uniform float uSeed;
uniform float uRotation;
uniform float uSize;
uniform int uOctaves;
uniform float uTailLength;
uniform float uTailWidth;
uniform float uAudioBoost;
uniform int uIonTail;
uniform vec2 uCenter;
uniform vec2 uCameraOffset;
uniform vec2 uTailDirection;
uniform vec4 uNucleusColor;
uniform vec4 uComaColor;
uniform vec4 uDustColor;
uniform vec4 uIonColor;

void main() {
    vec2 realUv = ppBodyUv(vUv, uAspect, uCenter, uCameraOffset, uDepth, uLayerRadius);
    vec2 uv = floor(realUv * uPixels) / uPixels;
    vec2 centered = uv - vec2(0.5);
    vec2 direction = normalize(uTailDirection);
    float along = dot(centered, direction);
    float across = abs(centered.x * direction.y - centered.y * direction.x);
    float noise = ppFbmUnit((uv + vec2(uTime * uTimeSpeed, 0.0)) * uSize, uSize, uSeed, uOctaves);
    float tailFade = 1.0 - smoothstep(0.02, uTailLength, along);
    float dust = step(across, uTailWidth * (1.0 - along / max(uTailLength, 0.01))) * tailFade;
    float ion = step(across, uTailWidth * 0.24) * (1.0 - smoothstep(0.04, uTailLength * 1.45, along)) * float(uIonTail);
    float coma = 1.0 - smoothstep(0.02, 0.16, length(centered));
    float nucleusNoise = ppFbmUnit((ppRotate(uv, uRotation) + vec2(2.0)) * uSize, uSize, uSeed + 4.0, uOctaves);
    float nucleus = step(length(centered), 0.075 + (nucleusNoise - 0.5) * 0.05);
    vec3 color = uDustColor.rgb;
    float alpha = dust * (0.18 + noise * 0.3) * (1.0 + uAudioBoost * 0.12);
    if (ion > alpha) { color = uIonColor.rgb; alpha = ion * 0.42; }
    if (coma > alpha) { color = uComaColor.rgb; alpha = coma * 0.26; }
    if (nucleus > 0.0) { color = uNucleusColor.rgb; alpha = 0.96; }
    outColor = vec4(color, clamp(alpha, 0.0, 1.0));
}
