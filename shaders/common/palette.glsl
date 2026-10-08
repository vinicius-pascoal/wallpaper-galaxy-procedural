vec3 starTemperature(float temperature) {
    vec3 cool = vec3(0.48, 0.67, 1.0);
    vec3 neutral = vec3(1.0, 0.94, 0.78);
    vec3 warm = vec3(1.0, 0.48, 0.22);
    return temperature < 0.5
        ? mix(cool, neutral, temperature * 2.0)
        : mix(neutral, warm, (temperature - 0.5) * 2.0);
}
