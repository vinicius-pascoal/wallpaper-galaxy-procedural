import { hash01, hashSeed } from "./Hash.js";
import { SeededRandom } from "./SeededRandom.js";
import { PlanetFactory, PlanetType } from "../celestial/PlanetFactory.js";
import { MoonGenerator } from "./MoonGenerator.js";
import { Star } from "../celestial/Star.js";
import { Pulsar } from "../celestial/Pulsar.js";
import { BinaryStarPair } from "../celestial/BinaryStarPair.js";
import { SolarSystem } from "../systems/SolarSystem.js";
import { AsteroidBelt } from "../systems/AsteroidBelt.js";
import { CometGenerator } from "./CometGenerator.js";

const ZONE = Object.freeze({ INNER: "inner", HABITABLE: "habitable", OUTER: "outer" });

function choosePlanetType(random, zone) {
  const roll = random.next();
  if (zone === ZONE.INNER) {
    return roll < 0.42 ? PlanetType.LAVA : roll < 0.58 ? PlanetType.NO_ATMOSPHERE
      : roll < 0.74 ? PlanetType.DRY_TERRAN : PlanetType.GAS;
  }
  if (zone === ZONE.OUTER) {
    return roll < 0.42 ? PlanetType.GAS : roll < 0.7 ? PlanetType.ICE
      : roll < 0.86 ? PlanetType.ISLANDS : PlanetType.DRY_TERRAN;
  }
  return roll < 0.34 ? PlanetType.TERRAN : roll < 0.5 ? PlanetType.ISLANDS
    : roll < 0.66 ? PlanetType.DRY_TERRAN : roll < 0.8 ? PlanetType.GAS
      : roll < 0.9 ? PlanetType.LAVA : PlanetType.ICE;
}

export class SystemGenerator {
  static createSystems(galaxySeed, count, options = {}) {
    const systems = new Array(count);
    const cosmicActivity = 0.18 + hash01(galaxySeed, "cosmic-activity") * 0.64;
    for (let index = 0; index < count; index += 1) {
      const seed = hashSeed(galaxySeed, `system-${index}`);
      const random = new SeededRandom(seed);
      const position = options.positions?.[index] ?? new Float32Array([
        random.range(-0.72, 0.72),
        random.range(-0.62, 0.62),
      ]);
      const depth = options.depths?.[index] ?? random.range(0.045, 0.075);
      const layer = index === 0 ? "HERO" : index < 2 ? "MIDGROUND" : "BACKGROUND";
      let star = new Star(hashSeed(seed, "star"), {
        radius: index === 0 ? random.range(0.04, 0.058) : random.range(0.018, 0.034),
        depth,
      });
      if (options.specialObjects !== false && random.chance(0.01 + cosmicActivity * 0.02)) {
        star = new Pulsar(hashSeed(seed, "pulsar"), { radius: star.radius, depth });
      }
      const planetCount = options.forceHero && index === 0 ? Math.max(3, random.int(3, 6)) : SystemGenerator._planetCount(random);
      const planets = new Array(planetCount);
      for (let planetIndex = 0; planetIndex < planetCount; planetIndex += 1) {
        const planetSeed = hashSeed(seed, `planet-${planetIndex}`);
        const orbitRadius = 0.105 + planetIndex * 0.064 + random.range(-0.012, 0.012);
        const zone = orbitRadius < 0.28 ? ZONE.INNER : orbitRadius < 0.43 ? ZONE.HABITABLE : ZONE.OUTER;
        const type = options.forceHero && index === 0 && planetIndex === 1
          ? PlanetType.TERRAN
          : choosePlanetType(new SeededRandom(hashSeed(planetSeed, "type")), zone);
        const orbit = {
          semiMajorAxis: orbitRadius,
          eccentricity: random.range(0.0, 0.18),
          inclination: random.range(0.82, 1.0),
          initialAngle: random.range(0, Math.PI * 2),
          speed: (0.011 + random.range(0.002, 0.009)) / Math.sqrt(orbitRadius),
          direction: random.chance(0.5) ? -1 : 1,
          zone,
        };
        const radius = index === 0 && planetIndex === 1
          ? random.range(0.075, 0.105)
          : random.range(0.014, 0.032);
        planets[planetIndex] = PlanetFactory.create({ type, seed: planetSeed, radius, orbit, depth: depth + 0.01 });
      }
      const moons = options.moons === false ? [] : planets.flatMap((planet) => MoonGenerator.createForPlanet(planet));
      const binary = options.specialObjects !== false && !star.kind.includes("pulsar") && random.chance(0.08 + random.range(0, 0.07))
        ? new BinaryStarPair(
          star,
          new Star(hashSeed(seed, "binary-companion"), {
            radius: star.radius * random.range(0.58, 0.9),
            depth: depth + 0.002,
          }),
          position,
          hashSeed(seed, "binary-pair"),
        )
        : null;
      const comets = options.comets === false ? [] : CometGenerator.createForSystem(seed, star, position, cosmicActivity);
      const belt = options.asteroidBelts === "off" || options.asteroidBelts === false ? null : random.chance(random.range(0.25, 0.4))
        ? new AsteroidBelt(hashSeed(seed, "asteroid-belt"), position, {
          count: random.int(16, 30),
          innerRadius: random.range(0.29, 0.39),
          outerRadius: random.range(0.44, 0.58),
        })
        : null;
      systems[index] = new SolarSystem(seed, position, star, planets, depth, layer, moons, belt, binary, comets);
    }
    return systems;
  }

  static _planetCount(random) {
    const roll = random.next();
    if (roll < 0.08) return 0;
    if (roll < 0.28) return random.int(1, 3);
    if (roll < 0.86) return random.int(3, 6);
    return random.int(6, 8);
  }
}
