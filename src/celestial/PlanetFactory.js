import { hashSeed } from "../procedural/Hash.js";
import { PaletteGenerator } from "../procedural/PaletteGenerator.js";
import { SeededRandom } from "../procedural/SeededRandom.js";
import { Planet } from "./Planet.js";
import { TerranPlanet } from "./planets/TerranPlanet.js";

export const PlanetType = Object.freeze({
  TERRAN: "terran",
  GAS: "gas",
  LAVA: "lava",
  ICE: "ice",
});

export class PlanetFactory {
  static create({ type, seed, radius = 0.03, orbit = null, depth = 0.06 }) {
    const planet = type === PlanetType.TERRAN ? new TerranPlanet(seed) : new Planet(seed, type);
    const random = new SeededRandom(hashSeed(seed, "planet-config"));
    planet.type = type;
    planet.radius = radius;
    planet.orbit = orbit;
    planet.depth = depth;
    planet.rotation = random.range(0, Math.PI * 2);
    planet.rotationSpeed = random.range(0.006, 0.016) * (random.chance(0.5) ? -1 : 1);
    planet.seed01 = (planet.seed >>> 0) / 4294967296;
    if (type === PlanetType.TERRAN) {
      planet.terrainScale = planet.terrainScale ?? random.range(4.4, 6.2);
      planet.cloudScale = planet.cloudScale ?? random.range(6.0, 8.0);
      planet.lightOrigin = planet.lightOrigin ?? new Float32Array([-0.45, 0.5]);
    } else if (type === PlanetType.GAS) {
      planet.palette = PaletteGenerator.gas(seed);
      planet.bandFrequency = random.range(4.0, 8.0);
      planet.bandWarp = random.range(0.5, 1.3);
      planet.hasRings = random.chance(0.42);
      planet.ringTilt = random.range(0.24, 0.58);
      planet.ringWidth = random.range(0.08, 0.16);
      planet.octaves = 4;
    } else if (type === PlanetType.LAVA) {
      planet.palette = PaletteGenerator.lava(seed);
      planet.lavaThreshold = random.range(0.56, 0.68);
      planet.crackScale = random.range(5.0, 8.0);
      planet.octaves = 4;
    } else if (type === PlanetType.ICE) {
      planet.palette = PaletteGenerator.ice(seed);
      planet.crackScale = random.range(5.0, 8.0);
      planet.iceCoverage = random.range(0.46, 0.68);
      planet.octaves = 4;
    }
    return planet;
  }
}
