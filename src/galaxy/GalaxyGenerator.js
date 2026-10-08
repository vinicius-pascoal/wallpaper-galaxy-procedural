import { hashSeed } from "../procedural/Hash.js";
import { SpiralGalaxy } from "./SpiralGalaxy.js";

export class GalaxyGenerator {
  static create(seed, count) {
    return new SpiralGalaxy(hashSeed(seed, "spiral-galaxy"), count);
  }
}
