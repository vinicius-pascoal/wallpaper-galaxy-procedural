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
uniform float uRingWidth;
uniform float uRingPerspective;
uniform float uScaleRelative;
uniform float uLightBorder1;
uniform float uLightBorder2;
uniform float uSize;
uniform int uOctaves;
uniform vec2 uCenter;
uniform vec2 uCameraOffset;
uniform vec2 uLightOrigin;
uniform vec3 uColor0;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uDarkColor0;
uniform vec3 uDarkColor1;
uniform vec3 uDarkColor2;

void main() {
    vec2 realUv = ppBodyUv(vUv, uAspect, uCenter, uCameraOffset, uDepth, uLayerRadius);
    vec2 uv = floor(realUv * uPixels) / uPixels;
    float lightDistance = distance(uv, uLightOrigin);
    uv = ppRotate(uv, uRotation);
    vec2 centerUv = uv - vec2(0.0, 0.5);
    centerUv *= vec2(1.0, uRingPerspective);
    float centerDistance = distance(centerUv, vec2(0.5, 0.0));

    float ring = smoothstep(0.5 - uRingWidth * 2.0, 0.5 - uRingWidth, centerDistance);
    ring *= smoothstep(centerDistance - uRingWidth, centerDistance, 0.4);
    if (uv.y < 0.5) ring *= step(1.0 / uScaleRelative, distance(uv, vec2(0.5)));

    centerUv = ppRotate(centerUv + vec2(0.0, 0.5), uTime * uTimeSpeed);
    ring *= ppFbm(centerUv * uSize, uSize, uSeed, uOctaves);
    float posterized = floor((ring + pow(lightDistance, 2.0) * 2.0) * 4.0) / 4.0;
    posterized = min(posterized, 2.0);
    vec3 color;
    if (posterized <= 1.0) {
        color = posterized < 0.5 ? uColor0 : (posterized < 1.0 ? uColor1 : uColor2);
    } else {
        color = posterized < 1.5 ? uDarkColor0 : (posterized < 2.0 ? uDarkColor1 : uDarkColor2);
    }
    outColor = vec4(color, step(0.28, ring));
}
