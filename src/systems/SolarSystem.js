import { OrbitSystem } from "./OrbitSystem.js";

export class SolarSystem {
  constructor(seed, positionNdc, star, planets, depth, layer = "MIDGROUND") {
    this.seed = seed >>> 0;
    this.position = positionNdc;
    this.star = star;
    this.planets = planets;
    this.depth = depth;
    this.layer = layer;
    this.orbits = new OrbitSystem(star, planets, positionNdc);
    this.orbitLayer = null;
    this.visible = true;
  }

  update(elapsed) {
    this.orbits.update(elapsed, this.position);
  }
}
