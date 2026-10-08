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
uniform float uBandSpeed;
uniform float uTurbulenceSpeed;
uniform float uBandFrequency;
uniform float uBandWarp;
uniform float uRingTilt;
uniform float uRingWidth;
uniform float uDepth;
uniform int uLod;
uniform int uHasRings;
uniform vec2 uCenter;
uniform vec2 uCameraOffset;
uniform vec2 uLightDirection;
uniform vec3 uColorDark;
uniform vec3 uColorBase;
uniform vec3 uColorLight;
uniform vec3 uRingColor;

void main() {
    vec2 world = vec2((vUv.x - 0.5) * 2.0 * uAspect, (vUv.y - 0.5) * 2.0);
    world -= uCameraOffset * uDepth;
    vec2 local = (world - uCenter) / uRadius;
    float localPixel = (2.0 / uInternalHeight) * uPixelScale / uRadius;
    vec2 pixelLocal = pixelateUv(local, localPixel);
    float distanceToCenter = length(pixelLocal);

    vec2 ringPoint = vec2(pixelLocal.x, pixelLocal.y / max(uRingTilt, 0.05));
    float ringDistance = length(ringPoint);
    float ring = smoothstep(1.02, 1.02 + uRingWidth, ringDistance);
    ring *= 1.0 - smoothstep(1.5 - uRingWidth, 1.5, ringDistance);
    ring *= 0.7 + 0.3 * noise2d(ringPoint * 5.0 + uSeed * 17.0);
    float ringAlpha = float(uHasRings) * ring * 0.52;
    bool inside = distanceToCenter <= 1.0;
    bool frontRing = inside && pixelLocal.y < -0.05;

    if (!inside && ringAlpha > 0.01) {
        outColor = vec4(uRingColor, ringAlpha);
        return;
    }
    if (!inside) discard;

    float sphereMask;
    vec3 normal = sphereNormal(pixelLocal, sphereMask);
    float differential = 0.86 + smoothstep(-1.0, 1.0, normal.y) * 0.34;
    vec3 bandPoint = rotateSphereY(normal, uInitialRotation + uTime * uBandSpeed * differential);
    vec3 turbulencePoint = rotateSphereY(normal, uInitialRotation + uTime * uTurbulenceSpeed);
    float bandNoise = uLod <= 1 ? 0.0 : fbm3(bandPoint * vec3(2.2, 4.0, 2.2) + vec3(uSeed * 7.0, uSeed * 3.0, -uSeed * 5.0), 2);
    float bands = 0.5 + 0.5 * sin(bandPoint.y * uBandFrequency * 6.28318 + bandNoise * uBandWarp * 4.0 + bandPoint.x * 2.0);
    float turbulence = uLod <= 1 ? 0.0 : fbm3(turbulencePoint * vec3(5.0, 10.0, 5.0) + vec3(uSeed * 2.0, -uSeed, uSeed * 4.0), int(uLod == 2 ? 2 : 4));
    float value = clamp(bands * 0.7 + turbulence * 0.46, 0.0, 1.0);
    float shade = sphereLighting(normal, vec3(uLightDirection, 0.82), 0.2);
    float posterized = ditheredBand(value * 0.72 + shade * 0.38, 4.0, gl_FragCoord.xy);
    vec3 surface = paletteRamp(uColorDark, uColorBase, uColorLight, posterized);
    if (frontRing && ringAlpha > 0.01) {
        surface = mix(surface, uRingColor, ringAlpha * 0.8);
    }
    outColor = vec4(surface, 1.0);
}
