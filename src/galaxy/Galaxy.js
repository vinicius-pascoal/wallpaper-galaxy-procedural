import { GalaxyGenerator } from "./GalaxyGenerator.js";

export class Galaxy {
  constructor(seed, count) {
    this.seed = seed >>> 0;
    this.spiral = GalaxyGenerator.create(this.seed, count);
    this.params = this.spiral.params;
    this.data = this.spiral.data;
    this.count = count;
  }

  get rotationSpeed() {
    return this.params.rotationSpeed;
  }
}
