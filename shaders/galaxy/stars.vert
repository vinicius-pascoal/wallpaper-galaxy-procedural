#version 300 es
precision highp float;

layout(location = 0) in vec2 aPosition;
layout(location = 1) in float aSize;
layout(location = 2) in float aBrightness;
layout(location = 3) in float aTemperature;
layout(location = 4) in float aTwinkleSpeed;
layout(location = 5) in float aPhase;
layout(location = 6) in float aDepth;

uniform float uTime;
uniform float uAspect;
uniform float uZoom;
uniform float uInternalHeight;
uniform vec2 uCameraOffset;
uniform float uGalaxyRotation;
uniform float uBrightnessScale;
uniform float uAudioBoost;

out float vBrightness;
out float vTemperature;
out float vTwinkle;

void main() {
    float twinkle = 0.78 + 0.22 * sin(uTime * aTwinkleSpeed + aPhase);
    vec2 position = aPosition + uCameraOffset * aDepth;
    position *= uZoom;
    gl_Position = vec4(position.x / uAspect, position.y, 0.0, 1.0);
    gl_PointSize = min(7.0, max(1.0, aSize * (0.92 + 0.08 * twinkle)));
    vBrightness = aBrightness * uBrightnessScale * (1.0 + uAudioBoost * 0.08);
    vTemperature = aTemperature;
    vTwinkle = twinkle;
}
