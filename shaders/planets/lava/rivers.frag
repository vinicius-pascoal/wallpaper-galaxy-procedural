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
uniform float uRiverCutoff;
uniform float uLightBorder1;
uniform float uLightBorder2;
uniform vec2 uCenter;
uniform vec2 uCameraOffset;
uniform vec2 uLightOrigin;
uniform vec3 uColor0;
uniform vec3 uColor1;
uniform vec3 uColor2;

void main() {
    vec2 realUv = ppBodyUv(vUv, uAspect, uCenter, uCameraOffset, uDepth, uLayerRadius);
    vec2 uv = floor(realUv * uPixels) / uPixels;
    float circleDistance = distance(uv, vec2(0.5));
    float alpha = step(circleDistance, 0.49999);
    float lightDistance = distance(uv, uLightOrigin);
    uv = ppRotate(uv, uRotation);
    uv = ppSpherify(uv);

    float fbm1 = ppFbm(uv * uSize + vec2(uTime * uTimeSpeed, 0.0), uSize, uSeed, uOctaves);
    float riverFbm = ppFbm(uv + fbm1 * 2.5, uSize, uSeed, uOctaves);
    lightDistance = pow(lightDistance, 2.0) * 0.4;
    lightDistance -= lightDistance * riverFbm;
    riverFbm = step(uRiverCutoff, riverFbm);

    vec3 color = uColor0;
    if (lightDistance > uLightBorder1) color = uColor1;
    if (lightDistance > uLightBorder2) color = uColor2;
    alpha *= step(uRiverCutoff, riverFbm);
    outColor = vec4(color, alpha);
}
