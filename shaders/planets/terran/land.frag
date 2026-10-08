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
uniform float uSize;
uniform int uOctaves;
uniform float uLandCutoff;
uniform float uLightBorder1;
uniform float uLightBorder2;
uniform vec2 uCenter;
uniform vec2 uCameraOffset;
uniform vec2 uLightOrigin;
uniform vec4 uColor0;
uniform vec4 uColor1;
uniform vec4 uColor2;
uniform vec4 uColor3;

void main() {
    vec2 realUv = ppBodyUv(vUv, uAspect, uCenter, uCameraOffset, uDepth, uLayerRadius);
    vec2 uv = floor(realUv * uPixels) / uPixels;
    float lightDistance = distance(uv, uLightOrigin);
    float circleDistance = distance(uv, vec2(0.5));
    float alpha = step(circleDistance, 0.49999);
    uv = ppRotate(uv, uRotation);
    uv = ppSpherify(uv);

    vec2 baseFbmUv = uv * uSize + vec2(uTime * uTimeSpeed, 0.0);
    float fbm1 = ppFbm(baseFbmUv, uSize, uSeed, uOctaves);
    float fbm2 = ppFbm(baseFbmUv - uLightOrigin * fbm1, uSize, uSeed, uOctaves);
    float fbm3 = ppFbm(baseFbmUv - uLightOrigin * 1.5 * fbm1, uSize, uSeed, uOctaves);
    float fbm4 = ppFbm(baseFbmUv - uLightOrigin * 2.0 * fbm1, uSize, uSeed, uOctaves);

    if (lightDistance < uLightBorder1) fbm4 *= 0.9;
    if (lightDistance > uLightBorder1) {
        fbm2 *= 1.05;
        fbm3 *= 1.05;
        fbm4 *= 1.05;
    }
    if (lightDistance > uLightBorder2) {
        fbm2 *= 1.3;
        fbm3 *= 1.4;
        fbm4 *= 1.8;
    }

    lightDistance = pow(lightDistance, 2.0) * 0.1;
    vec4 color = uColor3;
    if (fbm4 + lightDistance < fbm1) color = uColor2;
    if (fbm3 + lightDistance < fbm1) color = uColor1;
    if (fbm2 + lightDistance < fbm1) color = uColor0;
    outColor = vec4(color.rgb, step(uLandCutoff, fbm1) * alpha * color.a);
}
