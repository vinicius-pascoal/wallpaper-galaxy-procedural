import { hashSeed } from "../procedural/Hash.js";
import { PaletteGenerator } from "../procedural/PaletteGenerator.js";
import { SeededRandom } from "../procedural/SeededRandom.js";

export const MAX_NEBULAE = 4;

export class Nebula {
  constructor(seed, count) {
    this.seed = seed >>> 0;
    this.count = Math.min(MAX_NEBULAE, count);
    this.centers = new Float32Array(MAX_NEBULAE * 2);
    this.scales = new Float32Array(MAX_NEBULAE * 2);
    this.rotations = new Float32Array(MAX_NEBULAE);
    this.thresholds = new Float32Array(MAX_NEBULAE);
    this.softness = new Float32Array(MAX_NEBULAE);
    this.warpStrength = new Float32Array(MAX_NEBULAE);
    this.brightness = new Float32Array(MAX_NEBULAE);
    this.opacity = new Float32Array(MAX_NEBULAE);
    this.speeds = new Float32Array(MAX_NEBULAE);
    this.seedOffsets = new Float32Array(MAX_NEBULAE * 2);
    this.eventPulse = 0;
    this.colorA = new Float32Array(MAX_NEBULAE * 3);
    this.colorB = new Float32Array(MAX_NEBULAE * 3);
    this.colorC = new Float32Array(MAX_NEBULAE * 3);
    this._generate();
  }

  _generate() {
    for (let index = 0; index < this.count; index += 1) {
      const random = new SeededRandom(hashSeed(this.seed, `nebula-${index}`));
      const vectorOffset = index * 2;
      const colorOffset = index * 3;
      const palette = PaletteGenerator.nebula(random.nextUint());
      this.centers[vectorOffset] = random.range(-1.25, 1.25);
      this.centers[vectorOffset + 1] = random.range(-0.64, 0.68);
      this.scales[vectorOffset] = random.range(0.42, 0.88);
      this.scales[vectorOffset + 1] = random.range(0.22, 0.52);
      this.rotations[index] = random.range(-Math.PI, Math.PI);
      this.thresholds[index] = random.range(0.39, 0.5);
      this.softness[index] = random.range(0.16, 0.27);
      this.warpStrength[index] = random.range(0.48, 0.92);
      this.brightness[index] = random.range(0.36, 0.68);
      this.opacity[index] = random.range(0.1, 0.22);
      this.speeds[index] = random.range(0.0016, 0.0055);
      this.seedOffsets[vectorOffset] = random.range(0, 100);
      this.seedOffsets[vectorOffset + 1] = random.range(0, 100);
      this.colorA.set(palette.a, colorOffset);
      this.colorB.set(palette.b, colorOffset);
      this.colorC.set(palette.c, colorOffset);
    }
  }
}
