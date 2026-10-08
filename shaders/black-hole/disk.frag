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
uniform float uDiskWidth;
uniform float uRingPerspective;
uniform float uDistortionStrength;
uniform float uAudioBoost;
uniform bool uDistortionOnly;
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
    bool dith = ppDither(uv, realUv, uPixels);
    uv = ppRotate(uv, uRotation);
    vec2 direction = uv - vec2(0.5);
    float distanceToCenter = length(direction);
    float warp = uDistortionStrength / max(distanceToCenter, 0.08);
    warp *= 1.0 - smoothstep(0.22, 0.55, distanceToCenter);
    uv += normalize(direction) * warp;
    uv = floor(uv * uPixels) / uPixels;
    if (uDistortionOnly) {
        float distortionGlow = (1.0 - smoothstep(0.05, 0.42, distanceToCenter)) * uDistortionStrength * 24.0;
        outColor = vec4(uColor2, distortionGlow * 0.22);
        return;
    }

    vec2 original = uv;
    uv.x = (uv.x - 0.5) * 1.3 + 0.5;
    float wobble = sin(uTime * uTimeSpeed * 2.0) * 0.01;
    uv = ppRotate(uv, wobble);
    float width = uDiskWidth;
    vec2 lightOrigin = vec2(0.5);
    if (uv.y < 0.5) {
        uv.y += smoothstep(distance(vec2(0.5), uv), 0.5, 0.2);
        width += smoothstep(distance(vec2(0.5), uv), 0.5, 0.3);
        lightOrigin.y -= smoothstep(distance(vec2(0.5), uv), 0.5, 0.2);
    } else if (uv.y > 0.53) {
        uv.y -= smoothstep(distance(vec2(0.5), uv), 0.4, 0.17);
        width += smoothstep(distance(vec2(0.5), uv), 0.5, 0.2);
        lightOrigin.y += smoothstep(distance(vec2(0.5), uv), 0.5, 0.2);
    }

    float lightDistance = distance(original * vec2(1.0, uRingPerspective), lightOrigin * vec2(1.0, uRingPerspective)) * 0.3;
    vec2 diskUv = uv - vec2(0.0, 0.5);
    diskUv *= vec2(1.0, uRingPerspective);
    float centerDistance = distance(diskUv, vec2(0.5, 0.0));
    float disk = smoothstep(0.1 - width * 2.0, 0.5 - width, centerDistance);
    disk *= smoothstep(centerDistance - width, centerDistance, 0.4);
    float radial = clamp(centerDistance * 1.35, 0.0, 1.0);
    float differentialSpeed = mix(1.4, 0.7, smoothstep(0.15, 0.95, radial));
    diskUv = ppRotate(diskUv + vec2(0.0, 0.5), uTime * uTimeSpeed * 3.0 * differentialSpeed);
    float turbulence = ppFbmUnit(diskUv * uSize, uSize, uSeed, uOctaves);
    float ringCells = ppCircleNoiseUnit(diskUv * uSize + vec2(uTime * uTimeSpeed * 0.4), uSize, uSeed + 3.1);
    disk *= pow(turbulence, 0.5) * mix(0.72, 1.12, ringCells);
    if (dith || !uDitherEnabled) disk *= 1.2;
    float posterized = min(floor((disk + lightDistance) * 4.0), 4.0);
    vec3 color = posterized < 1.0 ? uColor0 : posterized < 2.0 ? uColor1 : posterized < 3.0 ? uColor2 : posterized < 4.0 ? uColor3 : uColor4;
    float alpha = step(0.15, disk);
    alpha *= 1.0 - smoothstep(0.02, 0.17, distanceToCenter);
    alpha *= 1.0 + uAudioBoost * 0.12;
    outColor = vec4(color, alpha);
}
