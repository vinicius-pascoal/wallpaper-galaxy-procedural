export class CelestialBody {
  constructor(seed) {
    this.seed = seed >>> 0;
    this.visible = true;
    this.depth = 0.08;
  }
}
