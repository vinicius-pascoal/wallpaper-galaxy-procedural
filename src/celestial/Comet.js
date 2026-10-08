import { hashSeed } from "../procedural/Hash.js";
import { PaletteGenerator } from "../procedural/PaletteGenerator.js";
import { SeededRandom } from "../procedural/SeededRandom.js";
import { CelestialBody } from "./CelestialBody.js";

export class Comet extends CelestialBody {
  constructor(seed, star, options = {}) {
    super(seed);
    const random = new SeededRandom(hashSeed(this.seed, "comet-config"));
    this.kind = "comet";
    this.type = "comet";
    this.star = star;
    this.position = new Float32Array(2);
    this.radius = options.radius ?? random.range(0.008, 0.018);
    this.initialRotation = random.range(0, Math.PI * 2);
    this.rotation = this.initialRotation;
    this.rotationSpeed = random.range(0.008, 0.02) * (random.chance(0.5) ? -1 : 1);
    this.tailLength = random.range(2.5, 6.0);
    this.tailWidth = random.range(0.12, 0.25);
    this.ionTail = random.chance(0.55);
    this.palette = PaletteGenerator.comet(this.seed);
    this.seed01 = (this.seed >>> 0) / 4294967296;
    this.depth = options.depth ?? 0.055;
    this.orbit = options.orbit ?? {
      semiMajorAxis: random.range(0.34, 0.72),
      eccentricity: random.range(0.55, 0.82),
      inclination: random.range(0.62, 1.0),
      initialAngle: random.range(0, Math.PI * 2),
      speed: random.range(0.003, 0.009),
      direction: random.chance(0.5) ? -1 : 1,
    };
    this.tailDirection = new Float32Array([1, 0]);
    this.orbitDepth = 0;
    this.renderDepth = this.depth;
  }

  update(elapsed, systemPosition) {
    const angle = this.orbit.initialAngle + elapsed * this.orbit.speed * this.orbit.direction;
    const radiusX = this.orbit.semiMajorAxis;
    const radiusY = radiusX * (1 - this.orbit.eccentricity);
    this.position[0] = systemPosition[0] + Math.cos(angle) * radiusX;
    this.position[1] = systemPosition[1] + Math.sin(angle) * radiusY * this.orbit.inclination;
    this.orbitAngle = angle;
    this.orbitDepth = Math.sin(angle);
    this.renderDepth = this.depth + this.orbitDepth * 0.008;
    this.rotation = this.initialRotation + elapsed * this.rotationSpeed;
    const awayX = this.position[0] - this.star.position[0];
    const awayY = this.position[1] - this.star.position[1];
    const length = Math.hypot(awayX, awayY) || 1;
    this.tailDirection[0] = awayX / length;
    this.tailDirection[1] = awayY / length;
  }
}
