import { hashSeed } from "./Hash.js";

export class SeededRandom {
  constructor(seed = 1) {
    this.state = (Number(seed) >>> 0) || 0x6d2b79f5;
  }

  nextUint() {
    let value = (this.state += 0x6d2b79f5) | 0;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return (value ^ (value >>> 14)) >>> 0;
  }

  next() {
    return this.nextUint() / 4294967296;
  }

  range(min, max) {
    return min + (max - min) * this.next();
  }

  int(min, maxExclusive) {
    return min + Math.floor(this.next() * (maxExclusive - min));
  }

  chance(probability) {
    return this.next() < probability;
  }

  derive(identifier) {
    return new SeededRandom(hashSeed(this.state, identifier));
  }
}
