import { SeededRandom } from "../procedural/SeededRandom.js";

export class StarField {
  constructor(seed, count) {
    this.seed = seed >>> 0;
    this.count = count;
    this.data = new Float32Array(count * 7);
    this._generate();
  }

  _generate() {
    const random = new SeededRandom(this.seed);
    for (let index = 0; index < this.count; index += 1) {
      const offset = index * 7;
      const rareBright = random.chance(0.025);
      this.data[offset] = random.range(-2.3, 2.3);
      this.data[offset + 1] = random.range(-1.25, 1.25);
      this.data[offset + 2] = rareBright ? random.range(1.6, 2.8) : random.range(0.72, 1.35);
      this.data[offset + 3] = rareBright ? random.range(0.45, 0.95) : random.range(0.12, 0.7);
      this.data[offset + 4] = random.next();
      this.data[offset + 5] = random.range(0.4, 2.1);
      this.data[offset + 6] = random.range(0.01, 0.18);
    }
  }
}
