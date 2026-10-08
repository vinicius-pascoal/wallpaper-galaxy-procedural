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
uniform float uLightDistance1;
uniform float uLightDistance2;
uniform bool uDitherEnabled;
uniform vec2 uCenter;
uniform vec2 uCameraOffset;
uniform vec2 uLightOrigin;
uniform vec3 uColor0;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec3 uColor4;

void main() {
    vec2 realUv = ppBodyUv(vUv, uAspect, uCenter, uCameraOffset, uDepth, uLayerRadius);
    vec2 uv = floor(realUv * uPixels) / uPixels;
    float alpha = step(distance(uv, vec2(0.5)), 0.49999);
    bool dith = ppDither(uv, realUv, uPixels);
    vec2 sphereUv = ppRotate(ppSpherify(uv), uRotation);
    float lightDistance = distance(uv, uLightOrigin);
    float f = ppFbmUnit(sphereUv * uSize + vec2(uTime * uTimeSpeed, 0.0), uSize, uSeed, uOctaves);
    lightDistance = smoothstep(-0.3, 1.2, lightDistance);
    if (lightDistance < uLightDistance1) lightDistance *= 0.9;
    if (lightDistance < uLightDistance2) lightDistance *= 0.9;
    float c = lightDistance * pow(max(f, 0.001), 0.8) * 3.5;
    if (dith || !uDitherEnabled) c = (c + 0.02) * 1.05;
    float posterize = min(floor(c * 4.0) / 4.0, 1.0);
    int index = int(posterize * 4.0);
    vec3 color = index == 0 ? uColor0 : index == 1 ? uColor1 : index == 2 ? uColor2 : index == 3 ? uColor3 : uColor4;
    outColor = vec4(color, alpha);
}
