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
    this.config = options.config ?? {};
    this.showNebulae = this.config.nebulaEnabled !== false;
    this.showPlanet = true;
    this.showOrbits = this.config.orbitLines ?? showOrbits;
    this.planetGallery = options.planetGallery ? new PlanetGallery(seed) : null;
    this.specialGallery = options.specialGallery ? new SpecialGallery(seed) : null;
    this.planetLayer = options.planetLayer ?? "composite";
    this.universe = new Universe(seed, quality, this.config);
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
    const audio = this.config.audioReactive === false ? {} : (this.config.audioState ?? {});
    const motion = { off: 0, low: 0.35, normal: 1, high: 1.35 }[this.config.motionIntensity] ?? 1;
    if (showStars && this.showNebulae && !isolatedView) {
      renderer.renderNebulae(this.universe.nebula, time, camera, {
        intensity: this.config.nebulaIntensity ?? 1,
        audioBoost: ((audio.lowMid ?? 0) + (audio.mid ?? 0)) * 0.12 * (this.config.nebulaReactivity ?? 1),
      });
    }
    if (showStars) {
      renderer.renderPoints(this.universe.starLayer, renderer.starsProgram, time, camera, 0, {
        brightness: 1 + (audio.bass ?? 0) * 0.08 * (this.config.starReactivity ?? 1),
        audioBoost: ((audio.highMid ?? 0) + (audio.treble ?? 0)) * 0.7 * (this.config.starReactivity ?? 1),
      });
    }
    if (showGalaxy) {
      renderer.renderPoints(this.universe.galaxyLayer, renderer.galaxyProgram, time, camera, this.universe.galaxy.rotationSpeed * (this.config.galaxyRotationSpeed ?? 1) * motion, {
        brightness: (this.config.galaxyBrightness ?? 1) * (this.config.galacticDust === false ? 0.58 : 1),
        audioBoost: (audio.bass ?? 0) * 0.14,
        rotationMultiplier: motion,
      });
    }
    if (!isolatedView && this.config.specialObjects !== false) {
      if (this.universe.blackHole) {
        this._renderBody(renderer, this.universe.blackHole, null, camera, time, 1);
      }
      this._renderSystems(renderer, camera, time);
    }
  }

  _renderSystems(renderer, camera, time) {
    if (this.config.solarSystemsEnabled === false) return;
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

  applyConfig(config = {}) {
    this.config = { ...this.config, ...config };
    this.showNebulae = this.config.nebulaEnabled !== false;
    this.showOrbits = this.config.orbitLines === true;
    this.universe.applyOptions(this.config);
  }

  regenerate(seed, quality, renderer, config = this.config) {
    this.config = config;
    this.universe.regenerate(seed, quality, renderer, config);
    this.showNebulae = config.nebulaEnabled !== false;
    this.showOrbits = config.orbitLines === true;
  }

  togglePlanet() {
    this.showPlanet = !this.showPlanet;
  }

  get stats() {
    return this.universe.stats;
  }
}
