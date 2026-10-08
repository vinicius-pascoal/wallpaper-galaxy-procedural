export class OrbitSystem {
  constructor(star, planets, systemPosition, moons = []) {
    this.star = star;
    this.planets = planets;
    this.moons = moons;
    this.lineData = this._buildLineData(systemPosition);
    this.renderBodies = [];
  }

  setMoons(moons) {
    this.moons = moons;
    this.renderBodies.length = 0;
    this.renderBodies.push(...this.planets, ...this.moons);
  }

  _buildLineData(systemPosition) {
    const segments = 48;
    const data = new Float32Array(this.planets.length * segments * 4);
    let offset = 0;
    for (let planetIndex = 0; planetIndex < this.planets.length; planetIndex += 1) {
      const orbit = this.planets[planetIndex].orbit;
      for (let segment = 0; segment < segments; segment += 1) {
        const a = (segment / segments) * Math.PI * 2;
        const b = ((segment + 1) / segments) * Math.PI * 2;
        data[offset] = systemPosition[0] + Math.cos(a) * orbit.semiMajorAxis;
        data[offset + 1] = systemPosition[1] + Math.sin(a) * orbit.semiMajorAxis * (1.0 - orbit.eccentricity) * orbit.inclination;
        data[offset + 2] = systemPosition[0] + Math.cos(b) * orbit.semiMajorAxis;
        data[offset + 3] = systemPosition[1] + Math.sin(b) * orbit.semiMajorAxis * (1.0 - orbit.eccentricity) * orbit.inclination;
        offset += 4;
      }
    }
    return data;
  }

  update(elapsed, systemPosition) {
    this.star.position[0] = systemPosition[0];
    this.star.position[1] = systemPosition[1];
    for (let index = 0; index < this.planets.length; index += 1) {
      const planet = this.planets[index];
      const orbit = planet.orbit;
      const angle = orbit.initialAngle + elapsed * orbit.speed * orbit.direction;
      const radiusX = orbit.semiMajorAxis;
      const radiusY = radiusX * (1.0 - orbit.eccentricity);
      planet.position[0] = systemPosition[0] + Math.cos(angle) * radiusX;
      planet.position[1] = systemPosition[1] + Math.sin(angle) * radiusY * orbit.inclination;
      planet.orbitAngle = angle;
      planet.orbitDepth = Math.sin(angle);
      planet.renderDepth = planet.depth + planet.orbitDepth * 0.008;
      planet.rotation = planet.initialRotation + elapsed * planet.rotationSpeed;
    }
    for (let index = 0; index < this.moons.length; index += 1) {
      const moon = this.moons[index];
      const parent = moon.parent;
      const orbit = moon.orbit;
      const angle = orbit.initialAngle + elapsed * orbit.speed * orbit.direction;
      const radiusX = orbit.semiMajorAxis;
      const radiusY = radiusX * (1.0 - orbit.eccentricity);
      moon.position[0] = parent.position[0] + Math.cos(angle) * radiusX;
      moon.position[1] = parent.position[1] + Math.sin(angle) * radiusY * orbit.inclination;
      moon.orbitAngle = angle;
      moon.orbitDepth = parent.orbitDepth + Math.sin(angle) * 0.18;
      moon.renderDepth = moon.depth + moon.orbitDepth * 0.008;
      moon.rotation = moon.initialRotation + elapsed * moon.rotationSpeed;
    }
    this.renderBodies.length = 0;
    this.renderBodies.push(...this.planets, ...this.moons);
    this.renderBodies.sort((a, b) => a.renderDepth - b.renderDepth);
  }
}
