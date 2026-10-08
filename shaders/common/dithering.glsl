#include "pixel.glsl"

float bayer4(vec2 pixel) {
    ivec2 p = ivec2(mod(floor(pixel), 4.0));
    int index = p.x + p.y * 4;
    const float matrix[16] = float[16](
        0.0, 8.0, 2.0, 10.0,
        12.0, 4.0, 14.0, 6.0,
        3.0, 11.0, 1.0, 9.0,
        15.0, 7.0, 13.0, 5.0
    );
    return (matrix[index] + 0.5) / 16.0;
}

float ditheredBand(float value, float levels, vec2 pixel) {
    return quantizeDither(value, levels, bayer4(pixel));
}
