import { Universe } from "./Universe.js";
import { PlanetGallery } from "./PlanetGallery.js";
import { SpecialGallery } from "./SpecialGallery.js";

const GALLERY_CAMERA = Object.freeze({
  getOffset(target) {
    target[0] = 0;
    target[1] = 0;
    return target;
  },
});

export class Scene {
  constructor(seed, quality, view = "all", showOrbits = false, options = {}) {
    this.view = view;
    this.showNebulae = true;
    this.showPlanet = true;
    this.showOrbits = showOrbits;
    this.planetGallery = options.planetGallery ? new PlanetGallery(seed) : null;
    this.specialGallery = options.specialGallery ? new SpecialGallery(seed) : null;
    this.planetLayer = options.planetLayer ?? "composite";
    this.universe = new Universe(seed, quality);
  }

  initialize(renderer) {
    this.universe.upload(renderer);
  }

  update(time) {
    this.universe.update(time);
    this.planetGallery?.update(time.elapsed);
    this.specialGallery?.update(time.elapsed);
  }

  render(renderer, camera, time) {
    if (this.planetGallery) {
      for (const body of this.planetGallery.bodies) {
        const light = body.kind === "star" ? null : this.planetGallery.light;
        renderer.renderBody(body, light, 3, time, GALLERY_CAMERA, this.planetLayer);
      }
      return;
    }
    if (this.specialGallery) {
      for (const body of this.specialGallery.bodies) {
        const light = body.kind === "comet" ? this.specialGallery.light : null;
        renderer.renderBody(body, light, 3, time, GALLERY_CAMERA, this.planetLayer);
      }
      renderer.renderShootingStars(this.specialGallery.shootingStars, GALLERY_CAMERA);
      return;
    }
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
      if (this.universe.blackHole) {
        this._renderBody(renderer, this.universe.blackHole, null, camera, time, 1);
      }
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
      const orbitingBodies = system.orbitingBodies;
      if (system.asteroidBelt) {
        renderer.renderAsteroidBelt(system.asteroidBelt, system.asteroidBelt.backData, system.asteroidBelt.backCount, camera, time);
      }
      for (const body of orbitingBodies) {
        if (body.orbitDepth >= 0) continue;
        this._renderBody(renderer, body, system.star, camera, time, body === universe.terran ? 1 : 0);
      }
      const stars = system.stars.slice().sort((a, b) => (a.renderDepth ?? a.depth) - (b.renderDepth ?? b.depth));
      for (const star of stars) {
        if ((star.orbitDepth ?? 0) < 0) this._renderBody(renderer, star, null, camera, time);
      }
      if (stars.length === 1) {
        this._renderBody(renderer, system.star, null, camera, time);
      }
      for (const star of stars) {
        if ((star.orbitDepth ?? 0) >= 0 && stars.length > 1) this._renderBody(renderer, star, null, camera, time);
      }
      for (const body of orbitingBodies) {
        if (body.orbitDepth < 0) continue;
        this._renderBody(renderer, body, system.star, camera, time, body === universe.terran ? 1 : 0);
      }
      if (system.asteroidBelt) {
        renderer.renderAsteroidBelt(system.asteroidBelt, system.asteroidBelt.frontData, system.asteroidBelt.frontCount, camera, time);
      }
      for (const comet of system.comets) {
        this._renderBody(renderer, comet, system.star, camera, time, 0);
      }
    }
    renderer.renderShootingStars(universe.cosmicEvents.shootingStars, camera);
  }

  _renderBody(renderer, body, star, camera, time, priority = 0) {
    if (!this.showPlanet && (body.kind === "planet" || body.kind === "moon")) return;
    if (!this.universe.lod.isVisible(body.position, body.radius, renderer.aspect)) {
      this.universe.lod.culled += 1;
      return;
    }
    const isDetailBody = body.kind === "planet" || body.kind === "moon" || body.kind === "asteroid"
      || body.kind === "black-hole" || body.kind === "comet" || body.kind === "pulsar";
    const level = this.universe.lod.classify(body.radius, renderer.internalHeight, isDetailBody, priority);
    this.universe.lod.record(level, body.kind);
    renderer.renderBody(body, star, level, time, camera, "composite");
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
