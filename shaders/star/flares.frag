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
uniform float uStormWidth;
uniform float uStormDitherWidth;
uniform float uScale;
uniform float uCircleAmount;
uniform float uCircleScale;
uniform float uSize;
uniform int uOctaves;
uniform bool uDitherEnabled;
uniform vec2 uCenter;
uniform vec2 uCameraOffset;
uniform vec4 uColor0;
uniform vec4 uColor1;

float flareCircle(vec2 uv) {
    float inverseAmount = 1.0 / uCircleAmount;
    if (mod(uv.y, inverseAmount * 2.0) < inverseAmount) uv.x += inverseAmount * 0.5;
    vec2 randomCoordinate = floor(uv * uCircleAmount) / uCircleAmount;
    uv = mod(uv, vec2(inverseAmount)) * uCircleAmount;
    float randomValue = ppRandUnit(randomCoordinate, uSize, uSeed);
    randomValue = clamp(randomValue, inverseAmount, 1.0 - inverseAmount);
    float circleDistance = distance(uv, vec2(randomValue));
    return smoothstep(circleDistance, circleDistance + 0.5, inverseAmount * uCircleScale * ppRandUnit(randomCoordinate * 1.5, uSize, uSeed));
}

void main() {
    vec2 realUv = ppBodyUv(vUv, uAspect, uCenter, uCameraOffset, uDepth, uLayerRadius);
    vec2 pixelized = floor(realUv * uPixels) / uPixels;
    bool dith = ppDither(realUv, pixelized, uPixels);
    pixelized = ppRotate(pixelized, uRotation);
    vec2 uv = pixelized;
    float angle = atan(uv.x - 0.5, uv.y - 0.5) * 0.4;
    float distanceToCenter = distance(pixelized, vec2(0.5));
    vec2 circleUv = vec2(distanceToCenter, angle);

    float noiseValue = ppFbm(circleUv * uSize - vec2(uTime * uTimeSpeed), uSize, uSeed, uOctaves);
    float circleValue = flareCircle(circleUv * uScale - vec2(uTime * uTimeSpeed) + vec2(noiseValue));
    circleValue *= 1.5;
    float secondaryNoise = ppFbm(circleUv * uSize - vec2(uTime) + vec2(100.0), uSize, uSeed, uOctaves);
    circleValue -= secondaryNoise * 0.1;

    float alpha = 0.0;
    if (1.0 - distanceToCenter > circleValue) {
        if (circleValue > uStormWidth - uStormDitherWidth + distanceToCenter && (dith || !uDitherEnabled)) alpha = 1.0;
        else if (circleValue > uStormWidth + distanceToCenter) alpha = 1.0;
    }
    float interpolate = floor(secondaryNoise + circleValue);
    vec4 color = interpolate < 1.0 ? uColor0 : uColor1;
    alpha *= step(secondaryNoise * 0.25, distanceToCenter);
    outColor = vec4(color.rgb, alpha * color.a);
}
