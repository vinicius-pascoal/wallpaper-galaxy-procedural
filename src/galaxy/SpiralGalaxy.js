import { SeededRandom } from "../procedural/SeededRandom.js";

export class SpiralGalaxy {
  constructor(seed, count) {
    this.seed = seed >>> 0;
    this.count = count;
    this.random = new SeededRandom(this.seed);
    this.params = this._createParameters();
    this.data = new Float32Array(count * 7);
    this._generate();
  }

  _createParameters() {
    const random = this.random;
    return {
      armCount: random.int(2, 5),
      radius: random.range(0.78, 0.98),
      coreRadius: random.range(0.18, 0.3),
      spiralFactor: random.range(2.35, 3.75),
      flattening: random.range(0.72, 0.9),
      starDensity: random.range(0.72, 1.0),
      armNoise: random.range(0.055, 0.16),
      rotationSpeed: random.range(0.006, 0.014),
      coreBrightness: random.range(0.88, 1.0),
      armOffset: random.range(0, Math.PI * 2),
    };
  }

  _generate() {
    const { armCount, radius, coreRadius, spiralFactor, flattening, armNoise, coreBrightness, armOffset } = this.params;
    const random = new SeededRandom(this.seed ^ 0x517cc1b7);
    for (let index = 0; index < this.count; index += 1) {
      const offset = index * 7;
      const coreStar = random.chance(0.24);
      const inArm = random.chance(0.72);
      let distance;

      if (coreStar) {
        distance = Math.pow(random.next(), 1.85) * coreRadius;
      } else {
        distance = Math.pow(random.next(), 0.62) * radius;
      }

      let angle;
      if (inArm) {
        const arm = random.int(0, armCount);
        const armAngle = armOffset + (arm / armCount) * Math.PI * 2;
        const angularNoise = random.range(-armNoise, armNoise) * (0.35 + distance);
        angle = armAngle + distance * spiralFactor + angularNoise;
      } else {
        angle = random.range(0, Math.PI * 2);
      }

      const halo = random.chance(0.09);
      const haloDistance = halo ? random.range(0.92, 1.28) : distance;
      const x = Math.cos(angle) * haloDistance;
      const y = Math.sin(angle) * haloDistance * flattening;
      const brightness = coreStar
        ? random.range(coreBrightness * 0.72, 1.0)
        : random.range(0.22, inArm ? 0.78 : 0.52) * (1.0 - halo * 0.24);

      this.data[offset] = x;
      this.data[offset + 1] = y;
      this.data[offset + 2] = coreStar ? random.range(1.4, 3.1) : random.range(0.72, 1.55);
      this.data[offset + 3] = random.next();
      this.data[offset + 4] = brightness;
      this.data[offset + 5] = random.range(0.35, 1.65);
      this.data[offset + 6] = Math.min(1.0, 0.05 + distance / 1.6 + random.range(0.0, 0.12));
    }
  }
}
