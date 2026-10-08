import { hashSeed } from "../procedural/Hash.js";
import { Galaxy } from "../galaxy/Galaxy.js";
import { Nebula } from "../galaxy/Nebula.js";
import { StarField } from "../galaxy/StarField.js";
import { TerranPlanet } from "../celestial/planets/TerranPlanet.js";

export class Universe {
  constructor(seed, quality) {
    this.seed = seed >>> 0;
    this.quality = quality;
    this.galaxy = new Galaxy(hashSeed(this.seed, "galaxy"), quality.galaxyCount);
    this.starField = new StarField(hashSeed(this.seed, "background-stars"), quality.starCount);
    this.nebula = new Nebula(hashSeed(this.seed, "nebulae"), quality.nebulaCount);
    this.terran = new TerranPlanet(hashSeed(this.seed, "hero-terran"));
    this.starLayer = null;
    this.galaxyLayer = null;
  }

  upload(renderer) {
    this.starLayer = renderer.createPointLayer(this.starField.data);
    this.galaxyLayer = renderer.createPointLayer(this.galaxy.data);
  }

  update() {
    // A estrutura é estática; animações contínuas acontecem nos shaders.
  }

  get stats() {
    return {
      starCount: this.starField.count,
      galaxyCount: this.galaxy.count,
      nebulaCount: this.nebula.count,
      systemCount: 0,
      planetCount: 1,
      terranSeed: this.terran.seed,
      terranRadius: this.terran.radius,
      fbmOctaves: this.terran.octaves,
    };
  }
}
