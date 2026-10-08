#version 300 es
precision highp float;

#include "../../common/pixelplanets.glsl"

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
uniform float uCloudCover;
uniform float uStretch;
uniform float uCloudCurve;
uniform float uLightBorder1;
uniform float uLightBorder2;
uniform float uBands;
uniform float uSize;
uniform int uOctaves;
uniform bool uDitherEnabled;
uniform vec2 uCenter;
uniform vec2 uCameraOffset;
uniform vec2 uLightOrigin;
uniform vec3 uColor0;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uDarkColor0;
uniform vec3 uDarkColor1;
uniform vec3 uDarkColor2;

float turbulence(vec2 uv) {
    float circleField = 0.0;
    for (int index = 0; index < 10; index += 1) {
        circleField += ppCircleNoise(uv * uSize * 0.3 + vec2(float(index + 1) + 10.0) + vec2(uTime * uTimeSpeed, 0.0), uSize, uSeed);
    }
    return circleField;
}

void main() {
    vec2 realUv = ppBodyUv(vUv, uAspect, uCenter, uCameraOffset, uDepth, uLayerRadius);
    vec2 uv = floor(realUv * uPixels) / uPixels;
    float lightDistance = distance(uv, uLightOrigin);
    float alpha = step(distance(uv, vec2(0.5)), 0.49999);
    bool dith = ppDither(uv, realUv, uPixels);
    uv = ppRotate(uv, uRotation);
    uv = ppSpherify(uv);
    uv.y += smoothstep(0.0, uCloudCurve, abs(uv.x - 0.4));

    float band = ppFbm(vec2(0.0, uv.y * uSize * uBands), uSize, uSeed, uOctaves);
    float turb = turbulence(uv);
    float fbm1 = ppFbm(uv * uSize, uSize, uSeed, uOctaves);
    float fbm2 = ppFbm(uv * vec2(1.0, 2.0) * uSize + vec2(fbm1) + vec2(-uTime * uTimeSpeed, 0.0) + vec2(turb), uSize, uSeed, uOctaves);
    fbm2 *= pow(band, 2.0) * 7.0;
    float light = fbm2 + lightDistance * 1.8;
    fbm2 += pow(lightDistance, 1.0) - 0.3;
    fbm2 = smoothstep(-0.2, 4.0 - fbm2, light);
    if (dith && uDitherEnabled) fbm2 *= 1.1;

    float posterized = floor(fbm2 * 4.0) / 2.0;
    vec3 color;
    if (fbm2 < 0.625) {
        color = posterized <= 1.0 ? (posterized < 0.5 ? uColor0 : uColor1) : uColor2;
    } else {
        color = posterized <= 1.0 ? uDarkColor0 : (posterized < 2.0 ? uDarkColor1 : uDarkColor2);
    }
    outColor = vec4(color, alpha);
}
