export class CelestialBody {
  constructor(seed) {
    this.seed = seed >>> 0;
    this.kind = "body";
    this.visible = true;
    this.depth = 0.08;
  }
}
