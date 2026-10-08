import { hashSeed } from "../procedural/Hash.js";
import { PaletteGenerator } from "../procedural/PaletteGenerator.js";
import { SeededRandom } from "../procedural/SeededRandom.js";
import { CelestialBody } from "./CelestialBody.js";

export class Asteroid extends CelestialBody {
  constructor(seed, options = {}) {
    super(seed);
    const random = new SeededRandom(hashSeed(this.seed, "asteroid-config"));
    this.kind = "asteroid";
    this.type = "asteroid";
    this.position = new Float32Array(2);
    this.radius = options.radius ?? random.range(0.01, 0.025);
    this.initialRotation = random.range(0, Math.PI * 2);
    this.rotation = this.initialRotation;
    this.rotationSpeed = random.range(0.01, 0.026) * (random.chance(0.5) ? -1 : 1);
    this.lightOrigin = new Float32Array([0.28, 0.3]);
    this.palette = PaletteGenerator.asteroid(this.seed);
    this.seed01 = (this.seed >>> 0) / 4294967296;
    this.depth = options.depth ?? 0.07;
    this.lod = 0;
  }
}
