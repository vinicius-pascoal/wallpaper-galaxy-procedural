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
uniform bool uDitherEnabled;
uniform vec2 uCenter;
uniform vec2 uCameraOffset;
uniform vec2 uLightOrigin;
uniform vec3 uColor0;
uniform vec3 uColor1;
uniform vec3 uColor2;

void main() {
    vec2 realUv = ppBodyUv(vUv, uAspect, uCenter, uCameraOffset, uDepth, uLayerRadius);
    vec2 uv = floor(realUv * uPixels) / uPixels;
    bool dith = ppDither(uv, realUv, uPixels);
    vec2 rotated = ppRotate(uv, uRotation);
    float distanceToCenter = distance(uv, vec2(0.5));
    float surface = ppFbmUnit(rotated * uSize, uSize, uSeed, uOctaves);
    float silhouette = step(distanceToCenter, 0.46 + (surface - 0.5) * 0.18);
    float light = distance(rotated, uLightOrigin);
    float relief = ppFbmUnit(rotated * uSize + vec2(3.7), uSize, uSeed + 2.1, uOctaves);
    float crater = ppCircleNoiseUnit(rotated * uSize + vec2(uTime * uTimeSpeed), uSize, uSeed + 4.0);
    vec3 color = uColor1;
    if (relief < 0.36 || (relief < 0.4 && (dith || !uDitherEnabled))) color = uColor0;
    if (relief > 0.67 || (relief > 0.63 && (dith || !uDitherEnabled))) color = uColor2;
    if (crater > 0.68) color = mix(color, uColor0, 0.62);
    if (light < 0.35) color = mix(color, uColor2, 0.28);
    outColor = vec4(color, silhouette);
}
