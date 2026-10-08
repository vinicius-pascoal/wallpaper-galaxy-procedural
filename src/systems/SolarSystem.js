import { OrbitSystem } from "./OrbitSystem.js";

export class SolarSystem {
  constructor(seed, positionNdc, star, planets, depth, layer = "MIDGROUND", moons = [], belt = null) {
    this.seed = seed >>> 0;
    this.position = positionNdc;
    this.star = star;
    this.planets = planets;
    this.moons = moons;
    this.asteroidBelt = belt;
    this.depth = depth;
    this.layer = layer;
    this.orbits = new OrbitSystem(star, planets, positionNdc, moons);
    this.orbits.setMoons(moons);
    this.orbitLayer = null;
    this.visible = true;
  }

  update(elapsed) {
    this.orbits.update(elapsed, this.position);
    this.asteroidBelt?.update(elapsed, this.position);
  }

  get orbitingBodies() {
    return this.orbits.renderBodies;
  }
}
