import { hashSeed } from "./Hash.js";
import { SeededRandom } from "./SeededRandom.js";
import { Comet } from "../celestial/Comet.js";

export class CometGenerator {
  static createForSystem(systemSeed, star, systemPosition, activity = 0.5) {
    const random = new SeededRandom(hashSeed(systemSeed, "comets"));
    const chance = 0.08 + activity * 0.12;
    if (!random.chance(chance)) return [];
    const count = random.chance(0.08 * activity) ? 2 : 1;
    const comets = new Array(count);
    for (let index = 0; index < count; index += 1) {
      const seed = hashSeed(systemSeed, `comet-${index}`);
      comets[index] = new Comet(seed, star, { depth: 0.054 + index * 0.001 });
      comets[index].update(random.range(0, 100), systemPosition);
    }
    return comets;
  }
}
