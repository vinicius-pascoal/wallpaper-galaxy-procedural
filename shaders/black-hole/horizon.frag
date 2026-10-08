#version 300 es
precision highp float;

#include "../common/pixelplanets.glsl"

in vec2 vUv;
out vec4 outColor;

uniform float uAspect;
uniform float uPixels;
uniform float uLayerRadius;
uniform float uDepth;
uniform vec2 uCenter;
uniform vec2 uCameraOffset;
uniform float uHorizonRadius;
uniform float uLightWidth;
uniform vec3 uCoreColor;
uniform vec3 uEdgeColor;
uniform vec3 uEdgeHotColor;

void main() {
    vec2 realUv = ppBodyUv(vUv, uAspect, uCenter, uCameraOffset, uDepth, uLayerRadius);
    vec2 uv = floor(realUv * uPixels) / uPixels;
    float distanceToCenter = distance(uv, vec2(0.5));
    float alpha = step(distanceToCenter, uHorizonRadius);
    vec3 color = uCoreColor;
    if (distanceToCenter > uHorizonRadius - uLightWidth) color = uEdgeColor;
    if (distanceToCenter > uHorizonRadius - uLightWidth * 0.5) color = uEdgeHotColor;
    outColor = vec4(color, alpha);
}
