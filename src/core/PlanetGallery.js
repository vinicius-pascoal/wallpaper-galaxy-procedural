import { hashSeed } from "../procedural/Hash.js";
import { PlanetFactory, PlanetType } from "../celestial/PlanetFactory.js";
import { Star } from "../celestial/Star.js";

const GALLERY_POSITIONS = Object.freeze([
  [-0.8, 0.0],
  [-0.4, 0.0],
  [0.0, 0.0],
  [0.4, 0.0],
  [0.8, 0.0],
]);

export class PlanetGallery {
  constructor(seed) {
    const gallerySeed = hashSeed(seed, "planet-gallery");
    this.star = new Star(hashSeed(gallerySeed, "star"), { radius: 0.19, depth: 0 });
    this.star.position[0] = GALLERY_POSITIONS[4][0];
    this.star.position[1] = GALLERY_POSITIONS[4][1];
    this.light = { position: new Float32Array([-0.45, 0.42]) };
    const definitions = [
      [PlanetType.TERRAN, 0],
      [PlanetType.GAS, 1],
      [PlanetType.LAVA, 2],
      [PlanetType.ICE, 3],
    ];
    this.planets = definitions.map(([type, index]) => {
      const planet = PlanetFactory.create({
        type,
        seed: hashSeed(gallerySeed, `planet-${type}`),
        radius: 0.19,
        depth: 0,
      });
      planet.position[0] = GALLERY_POSITIONS[index][0];
      planet.position[1] = GALLERY_POSITIONS[index][1];
      planet.orbitDepth = 0;
      return planet;
    });
    this.bodies = [this.planets[0], this.planets[1], this.planets[2], this.planets[3], this.star];
  }

  update() {
    for (const planet of this.planets) {
      planet.orbitDepth = 0;
      planet.renderDepth = planet.depth;
    }
  }
}
