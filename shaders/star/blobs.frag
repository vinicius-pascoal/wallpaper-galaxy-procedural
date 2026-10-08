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
uniform float uCircleAmount;
uniform float uCircleSize;
uniform float uSize;
uniform int uOctaves;
uniform vec2 uCenter;
uniform vec2 uCameraOffset;
uniform vec4 uColor;

float blobCircle(vec2 uv) {
    float inverseAmount = 1.0 / uCircleAmount;
    if (mod(uv.y, inverseAmount * 2.0) < inverseAmount) uv.x += inverseAmount * 0.5;
    vec2 randomCoordinate = floor(uv * uCircleAmount) / uCircleAmount;
    uv = mod(uv, vec2(inverseAmount)) * uCircleAmount;
    float randomValue = ppRandUnit(randomCoordinate, uSize, uSeed);
    randomValue = clamp(randomValue, inverseAmount, 1.0 - inverseAmount);
    float circleDistance = distance(uv, vec2(randomValue));
    return smoothstep(circleDistance, circleDistance + 0.5, inverseAmount * uCircleSize * ppRandUnit(randomCoordinate * 1.5, uSize, uSeed));
}

void main() {
    vec2 realUv = ppBodyUv(vUv, uAspect, uCenter, uCameraOffset, uDepth, uLayerRadius);
    vec2 pixelized = floor(realUv * uPixels) / uPixels;
    vec2 uv = ppRotate(pixelized, uRotation);
    float angle = atan(uv.x - 0.5, uv.y - 0.5);
    float distanceToCenter = distance(pixelized, vec2(0.5));
    float field = 0.0;
    for (int index = 0; index < 15; index += 1) {
        float randomValue = ppRandUnit(vec2(float(index)), uSize, uSeed);
        vec2 circleUv = vec2(distanceToCenter, angle);
        field += blobCircle(circleUv * uSize - vec2(uTime * uTimeSpeed) - vec2((1.0 / max(distanceToCenter, 0.001)) * 0.1) + vec2(randomValue));
    }
    field *= 0.37 - distanceToCenter;
    field = step(0.07, field - distanceToCenter);
    outColor = vec4(uColor.rgb, field * uColor.a);
}
