float fbm(vec2 p, int octaves) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int octave = 0; octave < 8; octave += 1) {
        if (octave >= octaves) {
            break;
        }
        value += noise2d(p) * amplitude;
        p = p * 2.03 + vec2(17.13, 11.71);
        amplitude *= 0.5;
    }
    return value;
}

float fbm3(vec3 p, int octaves) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int octave = 0; octave < 6; octave += 1) {
        if (octave >= octaves) {
            break;
        }
        value += noise3d(p) * amplitude;
        p = p * 2.03 + vec3(17.13, 11.71, 5.37);
        amplitude *= 0.5;
    }
    return value;
}
