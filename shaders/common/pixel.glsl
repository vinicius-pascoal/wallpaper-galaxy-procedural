vec2 pixelateUv(vec2 uv, float logicalPixelSize) {
    return (floor(uv / logicalPixelSize) + 0.5) * logicalPixelSize;
}

float quantizeDither(float value, float levels, float pattern) {
    float scaled = value * levels;
    return (floor(scaled) + step(fract(scaled), pattern)) / levels;
}
