float sphereLighting(vec3 normal, vec3 lightDirection, float ambient) {
    float diffuse = max(dot(normal, normalize(lightDirection)), 0.0);
    float terminator = smoothstep(0.02, 0.28, diffuse);
    return clamp(ambient + terminator * (1.0 - ambient), 0.0, 1.0);
}

float rimLighting(vec3 normal, float strength) {
    float rim = 1.0 - clamp(normal.z, 0.0, 1.0);
    return pow(rim, 2.2) * strength;
}
