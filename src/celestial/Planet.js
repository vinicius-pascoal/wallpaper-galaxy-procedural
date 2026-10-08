import { CelestialBody } from "./CelestialBody.js";

export class Planet extends CelestialBody {
  constructor(seed) {
    super(seed);
    this.type = "planet";
  }
}
