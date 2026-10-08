import { hashSeed } from "../procedural/Hash.js";
import { PlanetFactory, PlanetType } from "../celestial/PlanetFactory.js";
import { Moon, MoonType } from "../celestial/Moon.js";
import { Asteroid } from "../celestial/Asteroid.js";
import { Star } from "../celestial/Star.js";

const GALLERY_POSITIONS = Object.freeze([
  [-0.82, 0.34], [-0.55, 0.34], [-0.28, 0.34], [-0.01, 0.34], [0.26, 0.34], [0.53, 0.34], [0.8, 0.34],
  [-0.68, -0.32], [-0.34, -0.32], [0.0, -0.32], [0.34, -0.32], [0.68, -0.32],
]);

export class PlanetGallery {
  constructor(seed) {
    const gallerySeed = hashSeed(seed, "planet-gallery");
    this.star = new Star(hashSeed(gallerySeed, "star"), { radius: 0.12, depth: 0 });
    this.light = { position: new Float32Array([-0.45, 0.42]) };
    const definitions = [
      [PlanetType.TERRAN, 0], [PlanetType.GAS, 1], [PlanetType.LAVA, 2], [PlanetType.ICE, 3],
      [PlanetType.DRY_TERRAN, 4], [PlanetType.ISLANDS, 5], [PlanetType.NO_ATMOSPHERE, 6],
    ];
    this.planets = definitions.map(([type, index]) => {
      const planet = PlanetFactory.create({ type, seed: hashSeed(gallerySeed, `planet-${type}`), radius: 0.105, depth: 0 });
      planet.position[0] = GALLERY_POSITIONS[index][0];
      planet.position[1] = GALLERY_POSITIONS[index][1];
      planet.orbitDepth = 0;
      planet.renderDepth = 0;
      return planet;
    });

    this.moons = [
      this._createMoon(gallerySeed, MoonType.ROCKY, 7, 0.1),
      this._createMoon(gallerySeed, MoonType.ICY, 8, 0.1),
    ];
    this.asteroid = new Asteroid(hashSeed(gallerySeed, "gallery-asteroid"), { radius: 0.08, depth: 0 });
    this.asteroid.position[0] = GALLERY_POSITIONS[9][0];
    this.asteroid.position[1] = GALLERY_POSITIONS[9][1];
    this.asteroid.orbitDepth = 0;
    this.asteroid.renderDepth = 0;

    this.moons.forEach((moon) => { moon.orbitDepth = 0; moon.renderDepth = 0; });
    this.star.position[0] = GALLERY_POSITIONS[11][0];
    this.star.position[1] = GALLERY_POSITIONS[11][1];
    this.bodies = [...this.planets, ...this.moons, this.asteroid, this.star];
  }

  _createMoon(seed, type, positionIndex, radius) {
    const moonSeed = hashSeed(seed, `gallery-${type}`);
    const moon = new Moon(moonSeed, type, null);
    moon.type = type === MoonType.ICY ? PlanetType.ICE : PlanetType.ROCKY;
    const source = PlanetFactory.create({ type: moon.type, seed: moonSeed, radius, depth: 0 });
    moon.radius = radius;
    moon.palette = source.palette;
    moon.position[0] = GALLERY_POSITIONS[positionIndex][0];
    moon.position[1] = GALLERY_POSITIONS[positionIndex][1];
    return moon;
  }

  update(elapsed) {
    for (const body of this.bodies) {
      body.orbitDepth = 0;
      body.renderDepth = body.depth;
      if (body.kind === "asteroid") body.rotation = body.initialRotation + elapsed * body.rotationSpeed;
    }
  }
}
