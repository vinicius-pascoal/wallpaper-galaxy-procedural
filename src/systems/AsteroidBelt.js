import { hashSeed } from "../procedural/Hash.js";
import { PaletteGenerator } from "../procedural/PaletteGenerator.js";
import { SeededRandom } from "../procedural/SeededRandom.js";

export const ASTEROID_STRIDE = 8;

export class AsteroidBelt {
  constructor(seed, systemPosition, options = {}) {
    this.seed = seed >>> 0;
    this.palette = PaletteGenerator.asteroid(this.seed);
    this.position = systemPosition;
    const random = new SeededRandom(this.seed);
    this.count = options.count ?? random.int(16, 32);
    this.innerRadius = options.innerRadius ?? random.range(0.30, 0.42);
    this.outerRadius = options.outerRadius ?? this.innerRadius + random.range(0.08, 0.18);
    this.inclination = options.inclination ?? random.range(0.7, 1.0);
    this.density = options.density ?? random.range(0.7, 1.0);
    this.frontData = new Float32Array(this.count * ASTEROID_STRIDE);
    this.backData = new Float32Array(this.count * ASTEROID_STRIDE);
    this._items = new Array(this.count);
    for (let index = 0; index < this.count; index += 1) {
      const itemRandom = new SeededRandom(hashSeed(this.seed, `asteroid-${index}`));
      const radius = itemRandom.range(this.innerRadius, this.outerRadius);
      this._items[index] = {
        angle: itemRandom.range(0, Math.PI * 2),
        radius,
        speed: itemRandom.range(0.004, 0.012) / Math.sqrt(radius),
        direction: itemRandom.chance(0.5) ? -1 : 1,
        size: itemRandom.range(0.004, 0.011),
        brightness: itemRandom.range(0.65, 1.0),
        seed: (hashSeed(this.seed, `surface-${index}`) >>> 0) / 4294967296,
        rotation: itemRandom.range(0, Math.PI * 2),
        cluster: itemRandom.chance(0.2) ? itemRandom.range(-0.025, 0.025) : 0,
        jitter: itemRandom.range(0.002, 0.012),
        gap: itemRandom.chance(0.08),
      };
    }
    this.frontCount = 0;
    this.backCount = 0;
    this.frontLayer = null;
    this.backLayer = null;
  }

  update(elapsed, systemPosition) {
    this.position = systemPosition;
    this.frontCount = 0;
    this.backCount = 0;
    for (const item of this._items) {
      const angle = item.angle + elapsed * item.speed * item.direction;
      const radius = item.radius
        + item.cluster * Math.sin(elapsed * 0.02 + item.seed * 7.0)
        + Math.sin(elapsed * 0.017 + item.seed * 31.0) * item.jitter;
      const x = systemPosition[0] + Math.cos(angle) * radius;
      const y = systemPosition[1] + Math.sin(angle) * radius * this.inclination;
      const target = Math.sin(angle) >= 0 ? this.frontData : this.backData;
      const index = Math.sin(angle) >= 0 ? this.frontCount++ : this.backCount++;
      const offset = index * ASTEROID_STRIDE;
      target[offset] = x;
      target[offset + 1] = y;
      target[offset + 2] = item.size;
      target[offset + 3] = item.gap ? 0 : item.brightness * this.density;
      target[offset + 4] = item.seed;
      target[offset + 5] = item.rotation + elapsed * item.direction * 0.01;
      target[offset + 6] = Math.sin(angle);
      target[offset + 7] = 1;
    }
  }
}
