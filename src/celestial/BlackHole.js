import { hashSeed } from "../procedural/Hash.js";
import { PaletteGenerator } from "../procedural/PaletteGenerator.js";
import { SeededRandom } from "../procedural/SeededRandom.js";
import { CelestialBody } from "./CelestialBody.js";

export class BlackHole extends CelestialBody {
  constructor(seed, options = {}) {
    super(seed);
    const random = new SeededRandom(hashSeed(this.seed, "black-hole-config"));
    this.kind = "black-hole";
    this.type = "black-hole";
    this.position = new Float32Array(options.position ?? [0, 0]);
    this.radius = options.radius ?? random.range(0.045, 0.075);
    this.initialRotation = random.range(0, Math.PI * 2);
    this.rotation = this.initialRotation;
    this.rotationSpeed = random.range(0.006, 0.014) * (random.chance(0.5) ? -1 : 1);
    this.diskSpeed = random.range(0.006, 0.014);
    this.distortionStrength = random.range(0.006, 0.018);
    this.palette = PaletteGenerator.blackHole(this.seed);
    this.seed01 = (this.seed >>> 0) / 4294967296;
    this.depth = options.depth ?? 0.035;
    this.mode = options.mode ?? "special";
    this.lod = 0;
  }
}
