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
uniform float uLightBorder;
uniform vec2 uCenter;
uniform vec2 uCameraOffset;
uniform vec2 uLightOrigin;
uniform vec3 uColor0;
uniform vec3 uColor1;

float craterCircleNoise(vec2 uv) {
    float uvY = floor(uv.y);
    uv.x += uvY * 0.31;
    vec2 local = fract(uv);
    float h = ppRandUnit(vec2(floor(uv.x), uvY), uSize, uSeed);
    float distanceToCircle = length(local - 0.25 - h * 0.5);
    float radius = h * 0.25;
    return smoothstep(radius - 0.10 * radius, radius, distanceToCircle);
}

float craterField(vec2 uv) {
    float result = 1.0;
    for (int index = 0; index < 2; index += 1) {
        result *= craterCircleNoise(uv * uSize + vec2(float(index + 1) + 10.0) + vec2(uTime * uTimeSpeed, 0.0));
    }
    return 1.0 - result;
}

void main() {
    vec2 realUv = ppBodyUv(vUv, uAspect, uCenter, uCameraOffset, uDepth, uLayerRadius);
    vec2 uv = floor(realUv * uPixels) / uPixels;
    float circleDistance = distance(uv, vec2(0.5));
    float lightDistance = distance(uv, uLightOrigin);
    float alpha = step(circleDistance, 0.49999);
    uv = ppRotate(uv, uRotation);
    uv = ppSpherify(uv);
    float crater1 = craterField(uv);
    float crater2 = craterField(uv + (uLightOrigin - 0.5) * 0.03);
    vec3 color = uColor0;
    alpha *= step(0.5, crater1);
    if (crater2 < crater1 - (0.5 - lightDistance) * 2.0) color = uColor1;
    if (lightDistance > uLightBorder) color = uColor1;
    alpha *= step(circleDistance, 0.5);
    outColor = vec4(color, alpha);
}
