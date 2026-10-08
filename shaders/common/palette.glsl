vec3 starTemperature(float temperature) {
    vec3 cool = vec3(0.48, 0.67, 1.0);
    vec3 neutral = vec3(1.0, 0.94, 0.78);
    vec3 warm = vec3(1.0, 0.48, 0.22);
    return temperature < 0.5
        ? mix(cool, neutral, temperature * 2.0)
        : mix(neutral, warm, (temperature - 0.5) * 2.0);
}

vec3 paletteRamp(vec3 darkColor, vec3 baseColor, vec3 lightColor, float value) {
    vec3 lower = mix(darkColor, baseColor, smoothstep(0.0, 0.58, value));
    return mix(lower, lightColor, smoothstep(0.42, 1.0, value));
}

vec3 cosinePalette(float value, vec3 a, vec3 b, vec3 c, vec3 d) {
    return a + b * cos(6.2831853 * (c * value + d));
}
