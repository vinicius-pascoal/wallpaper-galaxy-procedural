#version 300 es
precision highp float;

#include "../common/pixelplanets.glsl"

in vec2 vUv;
out vec4 outColor;

uniform float uTime;
uniform float uAspect;
uniform float uPixels;
uniform float uLayerRadius;
uniform float uDepth;
uniform float uSeed;
uniform float uRotation;
uniform float uPulseSpeed;
uniform float uPulseAmplitude;
uniform float uBeamAngle;
uniform float uBeamLength;
uniform vec2 uCenter;
uniform vec2 uCameraOffset;
uniform vec4 uCoreColor;
uniform vec4 uBeamColor;

void main() {
    vec2 realUv = ppBodyUv(vUv, uAspect, uCenter, uCameraOffset, uDepth, uLayerRadius);
    vec2 uv = floor(realUv * uPixels) / uPixels - vec2(0.5);
    float pulse = 0.92 + sin(uTime * uPulseSpeed) * uPulseAmplitude;
    float radius = length(uv);
    vec2 axis = vec2(cos(uBeamAngle), sin(uBeamAngle));
    float beamAlong = abs(dot(uv, axis));
    float beamAcross = abs(uv.x * axis.y - uv.y * axis.x);
    float beam = step(beamAcross, 0.018) * (1.0 - smoothstep(0.08, uBeamLength, beamAlong));
    float core = step(radius, 0.07 * pulse);
    float halo = 1.0 - smoothstep(0.04, 0.18, radius);
    vec3 color = uBeamColor.rgb;
    float alpha = beam * 0.38 + halo * 0.14;
    if (core > 0.0) { color = uCoreColor.rgb; alpha = 0.94 * pulse; }
    outColor = vec4(color, clamp(alpha, 0.0, 0.98));
}
