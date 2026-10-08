import { hashSeed } from "../procedural/Hash.js";
import { PaletteGenerator } from "../procedural/PaletteGenerator.js";
import { SeededRandom } from "../procedural/SeededRandom.js";
import { Planet } from "./Planet.js";
import { TerranPlanet } from "./planets/TerranPlanet.js";

export const PlanetType = Object.freeze({
  TERRAN: "terran",
  DRY_TERRAN: "dry-terran",
  ISLANDS: "islands",
  NO_ATMOSPHERE: "no-atmosphere",
  ROCKY: "rocky",
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
    planet.initialRotation = planet.initialRotation || random.range(0, Math.PI * 2);
    planet.rotation = planet.initialRotation;
    planet.rotationSpeed = random.range(0.006, 0.016) * (random.chance(0.5) ? -1 : 1);
    planet.rotationDirection = planet.rotationSpeed < 0 ? -1 : 1;
    planet.seed01 = (planet.seed >>> 0) / 4294967296;
    if ([PlanetType.TERRAN, PlanetType.DRY_TERRAN, PlanetType.ISLANDS].includes(type)) {
      planet.terrainScale = planet.terrainScale ?? random.range(4.4, 6.2);
      planet.cloudScale = planet.cloudScale ?? random.range(6.0, 8.0);
      planet.lightOrigin = planet.lightOrigin ?? new Float32Array([-0.45, 0.5]);
      planet.cloudInitialRotation = planet.cloudInitialRotation ?? random.range(0, Math.PI * 2);
      planet.cloudRotationSpeed = planet.cloudRotationSpeed ?? random.range(0.014, 0.024);
      planet.cloudSpeed = planet.cloudRotationSpeed;
      planet.terrainSeed01 = planet.terrainSeed01 ?? planet.seed01;
      planet.cloudSeed01 = planet.cloudSeed01 ?? ((hashSeed(seed, "clouds") >>> 0) / 4294967296);
      planet.oceanSeed01 = planet.oceanSeed01 ?? ((hashSeed(seed, "ocean") >>> 0) / 4294967296);
      planet.palette = PaletteGenerator.terran(seed);
      planet.seaLevel = type === PlanetType.ISLANDS ? random.range(0.72, 0.82)
        : type === PlanetType.DRY_TERRAN ? random.range(0.92, 1.0) : random.range(0.58, 0.68);
      planet.cloudCoverage = type === PlanetType.DRY_TERRAN ? random.range(0.08, 0.2)
        : type === PlanetType.ISLANDS ? random.range(0.22, 0.42) : random.range(0.32, 0.58);
      if (type === PlanetType.DRY_TERRAN) planet.palette = PaletteGenerator.dryTerran(seed);
      if (type === PlanetType.ISLANDS) planet.palette = PaletteGenerator.islands(seed);
    } else if (type === PlanetType.NO_ATMOSPHERE || type === PlanetType.ROCKY) {
      planet.palette = PaletteGenerator.rocky(seed);
      planet.crackScale = random.range(4.0, 7.0);
      planet.octaves = 3;
      planet.hasAtmosphere = false;
    } else if (type === PlanetType.GAS) {
      planet.palette = PaletteGenerator.gas(seed);
      planet.bandFrequency = random.range(4.0, 8.0);
      planet.bandWarp = random.range(0.5, 1.3);
      planet.hasRings = random.chance(0.42);
      planet.ringTilt = random.range(0.24, 0.58);
      planet.ringWidth = random.range(0.08, 0.16);
      planet.bandSpeed = planet.rotationSpeed * random.range(0.92, 1.08);
      planet.turbulenceSpeed = planet.rotationSpeed * random.range(1.1, 1.35);
      planet.octaves = 4;
    } else if (type === PlanetType.LAVA) {
      planet.palette = PaletteGenerator.lava(seed);
      planet.lavaThreshold = random.range(0.56, 0.68);
      planet.crackScale = random.range(5.0, 8.0);
      planet.lavaFlowSpeed = random.range(0.004, 0.009) * (random.chance(0.5) ? -1 : 1);
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
