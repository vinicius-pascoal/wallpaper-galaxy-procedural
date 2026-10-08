#version 300 es
precision highp float;

layout(location = 0) in vec2 aPosition;
layout(location = 1) in float aSize;
layout(location = 2) in float aBrightness;
layout(location = 3) in float aSeed;
layout(location = 4) in float aRotation;
layout(location = 5) in float aDepth;

uniform float uAspect;
uniform float uInternalHeight;
uniform vec2 uCameraOffset;

out float vBrightness;
out float vSeed;
out float vRotation;

void main() {
    vec2 position = vec2(aPosition.x * uAspect, aPosition.y) + uCameraOffset * aDepth;
    gl_Position = vec4(position.x / uAspect, position.y, 0.0, 1.0);
    gl_PointSize = max(1.0, aSize * uInternalHeight * 2.0);
    vBrightness = aBrightness;
    vSeed = aSeed;
    vRotation = aRotation;
}
