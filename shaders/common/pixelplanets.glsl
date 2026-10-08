const float PP_PI = 3.14159265359;

float ppRandWrap(vec2 coord, float size, float seed, vec2 wrapSize, float magic) {
    coord = mod(coord, wrapSize * max(1.0, round(size)));
    return fract(sin(dot(coord, vec2(12.9898, 78.233))) * magic * seed);
}

float ppRand(vec2 coord, float size, float seed) {
    return ppRandWrap(coord, size, seed, vec2(2.0, 1.0), 15.5453);
}

float ppRandUnit(vec2 coord, float size, float seed) {
    return ppRandWrap(coord, size, seed, vec2(1.0), 15.5453);
}

float ppRandLakes(vec2 coord, float size, float seed) {
    return ppRandWrap(coord, size, seed, vec2(2.0, 1.0), 43758.5453);
}

float ppRandLakesUnit(vec2 coord, float size, float seed) {
    return ppRandWrap(coord, size, seed, vec2(2.0, 1.0), 43758.5453);
}

float ppNoiseWrap(vec2 coord, float size, float seed, vec2 wrapSize, float magic) {
    vec2 cell = floor(coord);
    vec2 local = fract(coord);
    vec2 cubic = local * local * (3.0 - 2.0 * local);
    float a = ppRandWrap(cell, size, seed, wrapSize, magic);
    float b = ppRandWrap(cell + vec2(1.0, 0.0), size, seed, wrapSize, magic);
    float c = ppRandWrap(cell + vec2(0.0, 1.0), size, seed, wrapSize, magic);
    float d = ppRandWrap(cell + vec2(1.0, 1.0), size, seed, wrapSize, magic);
    return mix(a, b, cubic.x) + (c - a) * cubic.y * (1.0 - cubic.x) + (d - b) * cubic.x * cubic.y;
}

float ppNoise(vec2 coord, float size, float seed) {
    return ppNoiseWrap(coord, size, seed, vec2(2.0, 1.0), 15.5453);
}

float ppNoiseUnit(vec2 coord, float size, float seed) {
    return ppNoiseWrap(coord, size, seed, vec2(1.0), 15.5453);
}

float ppNoiseLakes(vec2 coord, float size, float seed) {
    return ppNoiseWrap(coord, size, seed, vec2(2.0, 1.0), 43758.5453);
}

float ppNoiseLakesUnit(vec2 coord, float size, float seed) {
    return ppNoiseWrap(coord, size, seed, vec2(2.0, 1.0), 43758.5453);
}

float ppFbmWrap(vec2 coord, float size, float seed, int octaves, vec2 wrapSize, float magic) {
    float value = 0.0;
    float scale = 0.5;
    for (int octave = 0; octave < 20; octave += 1) {
        if (octave >= octaves) break;
        value += ppNoiseWrap(coord, size, seed, wrapSize, magic) * scale;
        coord *= 2.0;
        scale *= 0.5;
    }
    return value;
}

float ppFbm(vec2 coord, float size, float seed, int octaves) {
    return ppFbmWrap(coord, size, seed, octaves, vec2(2.0, 1.0), 15.5453);
}

float ppFbmUnit(vec2 coord, float size, float seed, int octaves) {
    return ppFbmWrap(coord, size, seed, octaves, vec2(1.0), 15.5453);
}

float ppFbmLakes(vec2 coord, float size, float seed, int octaves) {
    return ppFbmWrap(coord, size, seed, octaves, vec2(2.0, 1.0), 43758.5453);
}

float ppFbmLakesUnit(vec2 coord, float size, float seed, int octaves) {
    return ppFbmWrap(coord, size, seed, octaves, vec2(2.0, 1.0), 43758.5453);
}

float ppCircleNoiseWrap(vec2 uv, float size, float seed, vec2 wrapSize) {
    float uvY = floor(uv.y);
    uv.x += uvY * 0.31;
    vec2 local = fract(uv);
    float h = ppRandWrap(vec2(floor(uv.x), uvY), size, seed, wrapSize, 15.5453);
    float distanceToCircle = length(local - 0.25 - h * 0.5);
    float radius = h * 0.25;
    return smoothstep(0.0, radius, distanceToCircle * 0.75);
}

float ppCircleNoise(vec2 uv, float size, float seed) {
    return ppCircleNoiseWrap(uv, size, seed, vec2(2.0, 1.0));
}

float ppCircleNoiseUnit(vec2 uv, float size, float seed) {
    return ppCircleNoiseWrap(uv, size, seed, vec2(1.0));
}

vec2 ppRotate(vec2 coord, float angle) {
    coord -= 0.5;
    coord *= mat2(vec2(cos(angle), -sin(angle)), vec2(sin(angle), cos(angle)));
    return coord + 0.5;
}

vec2 ppSpherify(vec2 uv) {
    vec2 centered = uv * 2.0 - 1.0;
    float z = sqrt(max(0.0, 1.0 - dot(centered, centered)));
    vec2 sphere = centered / (z + 1.0);
    return sphere * 0.5 + 0.5;
}

bool ppDither(vec2 pixelUv, vec2 realUv, float pixels) {
    return mod(pixelUv.x + realUv.y, 2.0 / max(pixels, 1.0)) <= 1.0 / max(pixels, 1.0);
}

vec2 ppBodyUv(vec2 screenUv, float aspect, vec2 center, vec2 cameraOffset, float depth, float radius) {
    vec2 world = vec2((screenUv.x - 0.5) * 2.0 * aspect, (screenUv.y - 0.5) * 2.0);
    world -= cameraOffset * depth;
    return (world - center) / max(radius, 0.00001) * 0.5 + 0.5;
}
