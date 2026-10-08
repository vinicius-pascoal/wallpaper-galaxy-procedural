import { hashSeed } from "../procedural/Hash.js";
import { SeededRandom } from "../procedural/SeededRandom.js";

export class BinaryStarPair {
  constructor(primary, secondary, center, seed) {
    this.primary = primary;
    this.secondary = secondary;
    this.center = center;
    this.seed = seed >>> 0;
    const random = new SeededRandom(hashSeed(this.seed, "binary-orbit"));
    this.angle = random.range(0, Math.PI * 2);
    this.speed = random.range(0.006, 0.014) * (random.chance(0.5) ? -1 : 1);
    this.radiusA = random.range(0.018, 0.035);
    this.radiusB = random.range(0.022, 0.045);
    this.inclination = random.range(0.82, 1.0);
    this.primary.depth += 0.001;
    this.secondary.depth += 0.0015;
    this.primary.renderDepth = this.primary.depth;
    this.secondary.renderDepth = this.secondary.depth;
  }

  update(elapsed) {
    const angle = this.angle + elapsed * this.speed;
    const sine = Math.sin(angle) * this.inclination;
    const cosine = Math.cos(angle);
    this.primary.position[0] = this.center[0] + cosine * this.radiusA;
    this.primary.position[1] = this.center[1] + sine * this.radiusA;
    this.secondary.position[0] = this.center[0] - cosine * this.radiusB;
    this.secondary.position[1] = this.center[1] - sine * this.radiusB;
    this.primary.orbitDepth = Math.sin(angle);
    this.secondary.orbitDepth = -Math.sin(angle);
    this.primary.renderDepth = this.primary.depth + this.primary.orbitDepth * 0.008;
    this.secondary.renderDepth = this.secondary.depth + this.secondary.orbitDepth * 0.008;
    this.primary.rotation = this.primary.initialRotation + elapsed * this.primary.rotationSpeed;
    this.secondary.rotation = this.secondary.initialRotation + elapsed * this.secondary.rotationSpeed;
  }
}
