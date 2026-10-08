vec2 rotate2d(vec2 point, float angle) {
    float sine = sin(angle);
    float cosine = cos(angle);
    return mat2(cosine, -sine, sine, cosine) * point;
}

vec2 rotateAroundCenter(vec2 uv, float angle) {
    return rotate2d(uv - 0.5, angle) + 0.5;
}

vec3 rotateSphereY(vec3 point, float angle) {
    float sine = sin(angle);
    float cosine = cos(angle);
    return vec3(
        cosine * point.x + sine * point.z,
        point.y,
        -sine * point.x + cosine * point.z
    );
}
