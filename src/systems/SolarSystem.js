import { OrbitSystem } from "./OrbitSystem.js";

export class SolarSystem {
  constructor(seed, positionNdc, star, planets, depth, layer = "MIDGROUND", moons = [], belt = null, binary = null, comets = []) {
    this.seed = seed >>> 0;
    this.position = positionNdc;
    this.star = star;
    this.planets = planets;
    this.moons = moons;
    this.asteroidBelt = belt;
    this.binary = binary;
    this.comets = comets;
    this.stars = binary ? [binary.primary, binary.secondary] : [star];
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
    this.binary?.update(elapsed);
    for (const comet of this.comets) comet.update(elapsed, this.position);
  }

  get orbitingBodies() {
    return this.orbits.renderBodies;
  }
}
