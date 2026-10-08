import { hashSeed } from "../procedural/Hash.js";
import { Galaxy } from "../galaxy/Galaxy.js";
import { StarField } from "../galaxy/StarField.js";

export class Universe {
  constructor(seed, quality) {
    this.seed = seed >>> 0;
    this.quality = quality;
    this.galaxy = new Galaxy(hashSeed(this.seed, "galaxy"), quality.galaxyCount);
    this.starField = new StarField(hashSeed(this.seed, "background-stars"), quality.starCount);
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
      systemCount: 0,
      planetCount: 0,
    };
  }
}
