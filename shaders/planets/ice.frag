#version 300 es
precision highp float;

#include "../common/noise.glsl"
#include "../common/fbm.glsl"
#include "../common/pixel.glsl"
#include "../common/rotate.glsl"
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
uniform float uInitialRotation;
uniform float uCrackScale;
uniform float uIceCoverage;
uniform float uDepth;
uniform int uLod;
uniform vec2 uCenter;
uniform vec2 uCameraOffset;
uniform vec2 uLightDirection;
uniform vec3 uColorDark;
uniform vec3 uColorBase;
uniform vec3 uColorLight;
uniform vec3 uCrackColor;

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
    vec3 surfacePoint = rotateSphereY(normal, uInitialRotation + uTime * uRotationSpeed);
    float terrain = fbm3(surfacePoint * uCrackScale + vec3(uSeed * 8.0, -uSeed * 2.0, uSeed * 5.0), int(uLod <= 1 ? 2 : uLod == 2 ? 3 : 4));
    float fissures = fbm3(surfacePoint * uCrackScale * 2.2 + vec3(-uSeed * 6.0, uTime * uRotationSpeed * 0.15, uSeed * 3.0), 2);
    float iceMask = smoothstep(uIceCoverage - 0.1, uIceCoverage + 0.14, terrain);
    float crackMask = smoothstep(0.54, 0.67, fissures) * (1.0 - iceMask * 0.45);
    float light = sphereLighting(normal, vec3(uLightDirection, 0.82), 0.2);
    float shade = ditheredBand(light, 4.0, gl_FragCoord.xy);
    vec3 surface = paletteRamp(uColorDark, uColorBase, uColorLight, clamp(terrain * 0.8 + shade * 0.36, 0.0, 1.0));
    surface = mix(surface, uColorLight, iceMask * 0.24);
    surface = mix(surface, uCrackColor, crackMask * 0.56);
    outColor = vec4(surface, 1.0);
}
