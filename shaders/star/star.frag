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
uniform float uSurfaceSpeed;
uniform float uBlobSpeed;
uniform float uFlareSpeed;
uniform float uFlareStrength;
uniform float uActivity;
uniform float uDepth;
uniform int uLod;
uniform vec2 uCenter;
uniform vec2 uCameraOffset;
uniform vec3 uColorDark;
uniform vec3 uColorBase;
uniform vec3 uColorLight;
uniform vec3 uColorFlare;

void main() {
    vec2 world = vec2((vUv.x - 0.5) * 2.0 * uAspect, (vUv.y - 0.5) * 2.0);
    world -= uCameraOffset * uDepth;
    vec2 local = (world - uCenter) / uRadius;
    float localPixel = (2.0 / uInternalHeight) * uPixelScale / uRadius;
    vec2 pixelLocal = pixelateUv(local, localPixel);
    float distanceToCenter = length(pixelLocal);
    float haloWidth = localPixel * 4.0;
    float angle = atan(pixelLocal.y, pixelLocal.x);
    float flareRay = pow(max(0.0, cos(angle * 4.0 + uSeed * 18.0 + uTime * uFlareSpeed)), 18.0);
    float flare = flareRay * uFlareStrength * (1.0 - smoothstep(1.0, 1.0 + haloWidth, distanceToCenter));

    if (distanceToCenter > 1.0 + haloWidth) {
        if (flare < 0.01) discard;
        outColor = vec4(uColorFlare, flare);
        return;
    }

    if (distanceToCenter > 1.0) {
        outColor = vec4(uColorFlare, flare);
        return;
    }

    float sphereMask;
    vec3 normal = sphereNormal(pixelLocal, sphereMask);
    vec3 surfacePoint = rotateSphereY(normal, uInitialRotation + uTime * uSurfaceSpeed);
    vec3 blobPoint = rotateSphereY(normal, uInitialRotation * 0.7 + uTime * uBlobSpeed);
    float blobs = uLod <= 1 ? noise3d(surfacePoint * 5.0 + vec3(uSeed * 10.0)) : fbm3(surfacePoint * 7.5 + vec3(uSeed * 10.0, -uSeed * 3.0, uSeed * 6.0), 4);
    float granulation = uLod <= 1 ? 0.0 : fbm3(blobPoint * 18.0 + vec3(-uSeed * 4.0, uSeed * 2.0, -uSeed * 7.0), 2);
    float surfaceValue = clamp(blobs * 1.25 + granulation * 0.22 + uActivity * 0.1, 0.0, 1.0);
    float bands = ditheredBand(surfaceValue, 4.0, gl_FragCoord.xy);
    vec3 surface = paletteRamp(uColorDark, uColorBase, uColorLight, bands);
    float edge = rimLighting(normal, 0.2);
    surface += uColorLight * edge;
    surface += uColorFlare * flare * 0.35;
    outColor = vec4(surface, 1.0);
}
