import { hashSeed } from "../../procedural/Hash.js";
import { PaletteGenerator } from "../../procedural/PaletteGenerator.js";
import { SeededRandom } from "../../procedural/SeededRandom.js";
import { Planet } from "../Planet.js";

export class TerranPlanet extends Planet {
  constructor(seed) {
    super(seed);
    const random = new SeededRandom(hashSeed(this.seed, "terran-config"));
    this.centerNdc = new Float32Array([
      random.range(0.33, 0.43),
      random.range(-0.36, -0.24),
    ]);
    this.position = this.centerNdc;
    this.radius = random.range(0.22, 0.3);
    this.terrainScale = random.range(4.4, 6.2);
    this.cloudScale = random.range(6.0, 8.0);
    this.seaLevel = random.range(0.45, 0.55);
    this.rotationSpeed = random.range(0.009, 0.017) * (random.chance(0.5) ? -1 : 1);
    this.cloudSpeed = random.range(0.014, 0.024) * (random.chance(0.5) ? -1 : 1);
    this.cloudCoverage = random.range(0.56, 0.68);
    this.atmosphereStrength = random.range(0.26, 0.44);
    this.pixelScale = random.range(1.0, 1.8);
    this.lightOrigin = new Float32Array([random.range(-0.62, -0.34), random.range(0.34, 0.64)]);
    this.palette = PaletteGenerator.terran(this.seed);
    this.seed01 = (this.seed >>> 0) / 4294967296;
    this.depth = 0.08;
    this.octaves = 5;
    this.type = "terran";
  }
}
