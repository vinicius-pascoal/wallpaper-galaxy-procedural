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
uniform float uCloudCover;
uniform float uStretch;
uniform float uCloudCurve;
uniform float uLightBorder1;
uniform float uLightBorder2;
uniform vec2 uCenter;
uniform vec2 uCameraOffset;
uniform vec2 uLightOrigin;
uniform vec4 uColor0;
uniform vec4 uColor1;
uniform vec4 uColor2;
uniform vec4 uColor3;

float cloudAlpha(vec2 uv) {
    float circleField = 0.0;
    for (int index = 0; index < 9; index += 1) {
        circleField += ppCircleNoiseUnit(uv * uSize * 0.3 + vec2(float(index + 1) + 10.0) + vec2(uTime * uTimeSpeed, 0.0), uSize, uSeed);
    }
    return ppFbmUnit(uv * uSize + vec2(circleField) + vec2(uTime * uTimeSpeed, 0.0), uSize, uSeed, uOctaves);
}

void main() {
    vec2 realUv = ppBodyUv(vUv, uAspect, uCenter, uCameraOffset, uDepth, uLayerRadius);
    vec2 uv = floor(realUv * uPixels) / uPixels;
    float circleDistance = distance(uv, vec2(0.5));
    float alpha = step(circleDistance, 0.49999);
    float lightDistance = distance(uv, uLightOrigin);
    uv = ppRotate(uv, uRotation);
    uv = ppSpherify(uv);
    uv.y += smoothstep(0.0, uCloudCurve, abs(uv.x - 0.4));
    float field = cloudAlpha(uv * vec2(1.0, uStretch));

    vec4 color = uColor0;
    if (field < uCloudCover + 0.03) color = uColor1;
    if (lightDistance + field * 0.2 > uLightBorder1) color = uColor2;
    if (lightDistance + field * 0.2 > uLightBorder2) color = uColor3;
    field *= step(circleDistance, 0.5);
    outColor = vec4(color.rgb, step(uCloudCover, field) * alpha * color.a);
}
