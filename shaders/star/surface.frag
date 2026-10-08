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
uniform float uTiles;
uniform int uOctaves;
uniform bool uDitherEnabled;
uniform vec2 uCenter;
uniform vec2 uCameraOffset;
uniform vec4 uColor0;
uniform vec4 uColor1;
uniform vec4 uColor2;
uniform vec4 uColor3;

vec2 starHash2(vec2 point) {
    float randomValue = 523.0 * sin(dot(point, vec2(53.3158, 43.6143)));
    return vec2(fract(15.32354 * randomValue), fract(17.25865 * randomValue));
}

float cells(vec2 point, float numberOfCells) {
    point *= numberOfCells;
    float distanceToCell = 1.0e10;
    float tileCount = max(uTiles, 1.0);
    for (int xOffset = -1; xOffset <= 1; xOffset += 1) {
        for (int yOffset = -1; yOffset <= 1; yOffset += 1) {
            vec2 tiledPoint = floor(point) + vec2(float(xOffset), float(yOffset));
            tiledPoint = point - tiledPoint - starHash2(mod(tiledPoint, vec2(numberOfCells / tileCount)));
            distanceToCell = min(distanceToCell, dot(tiledPoint, tiledPoint));
        }
    }
    return sqrt(distanceToCell);
}

void main() {
    vec2 realUv = ppBodyUv(vUv, uAspect, uCenter, uCameraOffset, uDepth, uLayerRadius);
    vec2 pixelized = floor(realUv * uPixels) / uPixels;
    float alpha = step(distance(pixelized, vec2(0.5)), 0.49999);
    bool dith = ppDither(realUv, pixelized, uPixels);
    pixelized = ppRotate(pixelized, uRotation);
    pixelized = ppSpherify(pixelized);

    float value = cells(pixelized - vec2(uTime * uTimeSpeed * 2.0, 0.0), 10.0);
    value *= cells(pixelized - vec2(uTime * uTimeSpeed, 0.0), 20.0);
    value = clamp(value * 2.0, 0.0, 1.0);
    if (dith || !uDitherEnabled) value *= 1.3;
    float interpolate = floor(value * 3.0) / 3.0;
    vec4 color = interpolate < 0.333 ? uColor0 : (interpolate < 0.666 ? uColor1 : (interpolate < 0.999 ? uColor2 : uColor3));
    outColor = vec4(color.rgb, alpha * color.a);
}
