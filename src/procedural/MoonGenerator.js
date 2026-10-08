import { hashSeed } from "./Hash.js";
import { SeededRandom } from "./SeededRandom.js";
import { PlanetFactory, PlanetType } from "../celestial/PlanetFactory.js";
import { Moon, MoonType } from "../celestial/Moon.js";

function moonCount(random, parentType) {
  if (parentType === PlanetType.GAS) return random.int(1, 6);
  if (parentType === PlanetType.ICE) return random.int(0, 4);
  if (parentType === PlanetType.DRY_TERRAN) return random.int(0, 3);
  if (parentType === PlanetType.TERRAN) return random.int(0, 3);
  if (parentType === PlanetType.NO_ATMOSPHERE || parentType === PlanetType.ROCKY) return random.int(0, 3);
  return random.int(0, 2);
}

export class MoonGenerator {
  static createForPlanet(planet) {
    const random = new SeededRandom(hashSeed(planet.seed, "moons"));
    const count = moonCount(random, planet.type);
    const moons = new Array(count);
    for (let index = 0; index < count; index += 1) {
      const seed = hashSeed(planet.seed, `moon-${index}`);
      const moonRandom = new SeededRandom(seed);
      const icy = planet.type === PlanetType.ICE
        ? moonRandom.chance(0.72)
        : planet.type === PlanetType.GAS ? moonRandom.chance(0.35) : moonRandom.chance(0.18);
      const moon = new Moon(seed, icy ? MoonType.ICY : MoonType.ROCKY, planet);
      moon.type = icy ? PlanetType.ICE : PlanetType.ROCKY;
      moon.radius = planet.radius * moonRandom.range(0.10, 0.35);
      moon.palette = icy ? PlanetFactory.create({ type: PlanetType.ICE, seed }).palette
        : PlanetFactory.create({ type: PlanetType.ROCKY, seed }).palette;
      moon.seed01 = (seed >>> 0) / 4294967296;
      moon.initialRotation = moonRandom.range(0, Math.PI * 2);
      moon.rotation = moon.initialRotation;
      moon.rotationSpeed = moonRandom.range(0.002, 0.008) * (moonRandom.chance(0.5) ? -1 : 1);
      const parentRadius = planet.radius;
      const moonOrbitRadius = parentRadius * moonRandom.range(1.8, 3.6) + index * parentRadius * 0.35;
      moon.orbit = {
        parent: planet,
        semiMajorAxis: moonOrbitRadius,
        eccentricity: moonRandom.range(0.0, 0.12),
        inclination: moonRandom.range(0.72, 1.0),
        initialAngle: moonRandom.range(0, Math.PI * 2),
        speed: moonRandom.range(0.018, 0.036) / Math.sqrt(Math.max(moonOrbitRadius, 0.01)),
        direction: moonRandom.chance(0.5) ? -1 : 1,
      };
      moons[index] = moon;
    }
    return moons;
  }
}
