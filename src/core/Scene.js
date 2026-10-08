import { Universe } from "./Universe.js";

export class Scene {
  constructor(seed, quality, view = "all", showOrbits = false) {
    this.view = view;
    this.showNebulae = true;
    this.showPlanet = true;
    this.showOrbits = showOrbits;
    this.universe = new Universe(seed, quality);
  }

  initialize(renderer) {
    this.universe.upload(renderer);
  }

  update(time) {
    this.universe.update(time);
  }

  render(renderer, camera, time) {
    const showStars = this.view !== "galaxy";
    const showGalaxy = this.view !== "stars";
    const isolatedView = this.view === "stars" || this.view === "galaxy";
    if (showStars && this.showNebulae && !isolatedView) {
      renderer.renderNebulae(this.universe.nebula, time, camera);
    }
    if (showStars) {
      renderer.renderPoints(this.universe.starLayer, renderer.starsProgram, time, camera, 0);
    }
    if (showGalaxy) {
      renderer.renderPoints(this.universe.galaxyLayer, renderer.galaxyProgram, time, camera, this.universe.galaxy.rotationSpeed);
    }
    if (!isolatedView) {
      this._renderSystems(renderer, camera, time);
    }
  }

  _renderSystems(renderer, camera, time) {
    const universe = this.universe;
    universe.lod.beginFrame();
    for (let systemIndex = universe.systems.length - 1; systemIndex >= 0; systemIndex -= 1) {
      const system = universe.systems[systemIndex];
      if (!system.visible) continue;
      if (this.showOrbits) {
        renderer.renderOrbitLines(system, camera);
      }
      for (let index = 0; index < system.planets.length; index += 1) {
        const planet = system.planets[index];
        if (planet.orbitDepth >= 0) continue;
        this._renderBody(renderer, planet, system.star, camera, time);
      }
      this._renderBody(renderer, system.star, null, camera, time);
      for (let index = 0; index < system.planets.length; index += 1) {
        const planet = system.planets[index];
        if (planet.orbitDepth < 0) continue;
        this._renderBody(renderer, planet, system.star, camera, time);
      }
    }
  }

  _renderBody(renderer, body, star, camera, time) {
    if (!this.showPlanet && body.kind === "planet") return;
    if (!this.universe.lod.isVisible(body.position, body.radius, renderer.aspect)) {
      this.universe.lod.culled += 1;
      return;
    }
    const level = this.universe.lod.classify(body.radius, renderer.internalHeight, body.kind === "planet");
    this.universe.lod.record(level);
    renderer.renderBody(body, star, level, time, camera);
  }

  toggleNebulae() {
    this.showNebulae = !this.showNebulae;
  }

  togglePlanet() {
    this.showPlanet = !this.showPlanet;
  }

  get stats() {
    return this.universe.stats;
  }
}
