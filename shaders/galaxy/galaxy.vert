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
uniform float uGalaxyRotation;
uniform vec2 uCameraOffset;

out float vBrightness;
out float vTemperature;
out float vTwinkle;

void main() {
    float twinkle = 0.82 + 0.18 * sin(uTime * aTwinkleSpeed + aPhase);
    float angle = uGalaxyRotation * (0.42 + aDepth * 0.45);
    float sine = sin(angle);
    float cosine = cos(angle);
    vec2 rotated = vec2(
        aPosition.x * cosine - aPosition.y * sine,
        aPosition.x * sine + aPosition.y * cosine
    );
    vec2 position = rotated + uCameraOffset * (0.32 + aDepth * 0.68);
    position *= uZoom;
    gl_Position = vec4(position.x / uAspect, position.y, 0.0, 1.0);
    gl_PointSize = min(8.0, max(1.0, aSize * (0.94 + 0.06 * twinkle)));
    vBrightness = aBrightness;
    vTemperature = aTemperature;
    vTwinkle = twinkle;
}
