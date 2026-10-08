import { hashSeed } from "../procedural/Hash.js";
import { PaletteGenerator } from "../procedural/PaletteGenerator.js";
import { SeededRandom } from "../procedural/SeededRandom.js";
import { CelestialBody } from "./CelestialBody.js";

export const StarType = Object.freeze({
  RED: "red",
  ORANGE: "orange",
  YELLOW: "yellow",
  WHITE: "white",
  BLUE: "blue",
});

const STAR_TYPES = [StarType.RED, StarType.ORANGE, StarType.YELLOW, StarType.WHITE, StarType.BLUE];

export class Star extends CelestialBody {
  constructor(seed, options = {}) {
    super(seed);
    const random = new SeededRandom(hashSeed(this.seed, "star-config"));
    const roll = random.next();
    const type = options.type ?? (roll < 0.24 ? StarType.RED : roll < 0.5 ? StarType.ORANGE : roll < 0.78 ? StarType.YELLOW : roll < 0.95 ? StarType.WHITE : StarType.BLUE);
    this.kind = "star";
    this.starType = type;
    this.position = new Float32Array(2);
    this.radius = options.radius ?? random.range(0.026, 0.052);
    this.temperature = type === StarType.RED ? random.range(2600, 3700)
      : type === StarType.ORANGE ? random.range(3700, 5000)
        : type === StarType.YELLOW ? random.range(5000, 6800)
          : type === StarType.WHITE ? random.range(6800, 10000)
            : random.range(10000, 18000);
    this.rotationSpeed = random.range(0.006, 0.014) * (random.chance(0.5) ? -1 : 1);
    this.flareStrength = random.range(0.18, 0.5);
    this.activity = random.range(0.3, 0.86);
    this.luminosity = random.range(0.72, 1.0);
    this.palette = PaletteGenerator.star(this.seed, type);
    this.seed01 = (this.seed >>> 0) / 4294967296;
    this.depth = options.depth ?? 0.07;
    this.lod = 0;
  }

  static supportedTypes() {
    return STAR_TYPES;
  }
}
