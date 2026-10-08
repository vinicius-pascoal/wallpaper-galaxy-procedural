#version 300 es
precision highp float;

#include "../common/noise.glsl"
#include "../common/fbm.glsl"
#include "../common/pixel.glsl"
#include "../common/sphere.glsl"
#include "../common/dithering.glsl"
#include "../common/palette.glsl"
#include "../common/lighting.glsl"

in vec2 vUv;
out vec4 outColor;

uniform float uTime;
uniform float uAspect;
uniform float uInternalHeight;
uniform float uPixelScale;
uniform float uRadius;
uniform float uSeed;
uniform float uRotationSpeed;
uniform float uCrackScale;
uniform float uLavaThreshold;
uniform float uDepth;
uniform int uLod;
uniform vec2 uCenter;
uniform vec2 uCameraOffset;
uniform vec2 uLightDirection;
uniform vec3 uCrustDark;
uniform vec3 uCrust;
uniform vec3 uHot;
uniform vec3 uGlow;

void main() {
    vec2 world = vec2((vUv.x - 0.5) * 2.0 * uAspect, (vUv.y - 0.5) * 2.0);
    world -= uCameraOffset * uDepth;
    vec2 local = (world - uCenter) / uRadius;
    float localPixel = (2.0 / uInternalHeight) * uPixelScale / uRadius;
    vec2 pixelLocal = pixelateUv(local, localPixel);
    float distanceToCenter = length(pixelLocal);
    if (distanceToCenter > 1.0) discard;

    float sphereMask;
    vec3 normal = sphereNormal(pixelLocal, sphereMask);
    vec2 uv = sphereUv(normal);
    uv.x = fract(uv.x + uTime * uRotationSpeed * 0.08 + uSeed * 0.29);
    float crust = fbm(uv * uCrackScale + uSeed * 11.0, int(uLod <= 1 ? 2 : uLod == 2 ? 3 : 4));
    float cracks = fbm(uv * (uCrackScale * 1.9) - uSeed * 4.0, 2);
    float lavaMask = smoothstep(uLavaThreshold - 0.08, uLavaThreshold + 0.04, cracks + crust * 0.34);
    float light = sphereLighting(normal, vec3(uLightDirection, 0.82), 0.12);
    float shade = ditheredBand(light, 4.0, gl_FragCoord.xy);
    vec3 surface = mix(uCrustDark, uCrust, clamp(crust * 1.4 + shade * 0.3, 0.0, 1.0));
    surface = mix(surface, uHot, lavaMask);
    surface += uGlow * lavaMask * (0.24 + 0.72 * (1.0 - light));
    outColor = vec4(surface, 1.0);
}
