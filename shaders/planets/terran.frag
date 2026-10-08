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
uniform float uTerrainScale;
uniform float uCloudScale;
uniform float uSeaLevel;
uniform float uRotationSpeed;
uniform float uCloudSpeed;
uniform float uCloudCoverage;
uniform float uAtmosphereStrength;
uniform float uDepth;
uniform float uOctaves;
uniform int uLod;
uniform vec2 uCenter;
uniform vec2 uCameraOffset;
uniform vec2 uLightDirection;
uniform vec3 uOceanDark;
uniform vec3 uOceanLight;
uniform vec3 uLandDark;
uniform vec3 uLandBase;
uniform vec3 uLandLight;
uniform vec3 uCloudShadow;
uniform vec3 uCloudLight;
uniform vec3 uAtmosphere;

void main() {
    vec2 world = vec2((vUv.x - 0.5) * 2.0 * uAspect, (vUv.y - 0.5) * 2.0);
    world -= uCameraOffset * uDepth;
    vec2 local = (world - uCenter) / uRadius;
    float localPixel = (2.0 / uInternalHeight) * uPixelScale / uRadius;
    vec2 pixelLocal = pixelateUv(local, localPixel);
    float distanceToCenter = length(pixelLocal);
    float haloWidth = localPixel * 3.0;

    if (distanceToCenter > 1.0 + haloWidth) {
        discard;
    }

    if (distanceToCenter > 1.0) {
        float halo = 1.0 - smoothstep(1.0, 1.0 + haloWidth, distanceToCenter);
        outColor = vec4(uAtmosphere * halo * 0.7, halo * uAtmosphereStrength * 0.7);
        return;
    }

    float sphereMask;
    vec3 normal = sphereNormal(pixelLocal, sphereMask);
    vec2 surfaceUv = sphereUv(normal);
    surfaceUv.x = fract(surfaceUv.x + uTime * uRotationSpeed * 0.08 + uSeed * 0.37);
    vec2 terrainUv = surfaceUv * vec2(uTerrainScale, uTerrainScale * 0.78) + vec2(uSeed * 13.7, uSeed * 5.1);

    float terrainWarpX = fbm(terrainUv * 1.41 + vec2(2.1, 8.2), 2);
    float terrainWarpY = fbm(terrainUv * 1.63 + vec2(7.4, 1.6), 2);
    float terrain = fbm(terrainUv + vec2(terrainWarpX, terrainWarpY) * 1.25, uLod <= 1 ? 2 : uLod == 2 ? 3 : int(uOctaves));
    float oceanNoise = fbm(terrainUv * 1.8 + vec2(19.0, -7.0), 2);

    vec3 lightDirection = normalize(vec3(uLightDirection, 0.82));
    float light = sphereLighting(normal, lightDirection, 0.17);
    float dither = bayer4(gl_FragCoord.xy);
    float landThreshold = uSeaLevel + (dither - 0.5) * 0.035;
    float landMask = step(landThreshold, terrain);
    float landValue = clamp(terrain * 1.45 + light * 0.28, 0.0, 1.0);
    vec3 ocean = mix(uOceanDark, uOceanLight, clamp(oceanNoise * 0.62 + light * 0.38, 0.0, 1.0));
    vec3 land = paletteRamp(uLandDark, uLandBase, uLandLight, landValue);
    vec3 surface = mix(ocean, land, landMask);

    vec2 cloudUv = surfaceUv * vec2(uCloudScale, uCloudScale * 0.72) + vec2(uSeed * 3.7, uSeed * 17.1);
    cloudUv.x += uTime * uCloudSpeed * 0.32;
    float cloudWarp = fbm(cloudUv * 1.55 + vec2(5.3, 3.7), 2);
    float cloudField = fbm(cloudUv + vec2(cloudWarp * 1.25, -cloudWarp * 0.82), 3);
    float cloudMask = uLod <= 1 ? 0.0 : smoothstep(uCloudCoverage, uCloudCoverage + 0.14, cloudField);
    cloudMask *= 0.3 + light * 0.7;
    float cloudShade = ditheredBand(light, 4.0, gl_FragCoord.xy);
    surface = mix(surface, mix(uCloudShadow, uCloudLight, cloudShade), cloudMask * 0.76);

    float shade = ditheredBand(light, 5.0, gl_FragCoord.xy);
    surface *= 0.62 + shade * 0.56;
    surface += uAtmosphere * rimLighting(normal, uAtmosphereStrength * 0.32);
    outColor = vec4(surface, 1.0);
}
