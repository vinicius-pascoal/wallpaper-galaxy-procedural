const float PI = 3.14159265359;

vec3 sphereNormal(vec2 diskUv, out float mask) {
    float radiusSquared = dot(diskUv, diskUv);
    mask = 1.0 - step(1.0, radiusSquared);
    float z = sqrt(max(0.0, 1.0 - radiusSquared));
    return normalize(vec3(diskUv, z));
}

vec2 sphereUv(vec3 normal) {
    float longitude = atan(normal.x, normal.z) / (2.0 * PI) + 0.5;
    float latitude = asin(clamp(normal.y, -1.0, 1.0)) / PI + 0.5;
    return vec2(longitude, latitude);
}

vec2 spherify(vec2 uv) {
    vec2 centered = uv * 2.0 - 1.0;
    float z = sqrt(max(0.0, 1.0 - dot(centered, centered)));
    vec2 sphere = centered / (z + 1.0);
    return sphere * 0.5 + 0.5;
}
