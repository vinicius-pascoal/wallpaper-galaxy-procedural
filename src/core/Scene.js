import { Universe } from "./Universe.js";

export class Scene {
  constructor(seed, quality, view = "all") {
    this.view = view;
    this.showNebulae = true;
    this.showPlanet = true;
    this.universe = new Universe(seed, quality);
  }

  initialize(renderer) {
    this.universe.upload(renderer);
  }

  update() {
    this.universe.update();
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
    if (!isolatedView && this.showPlanet) {
      renderer.renderPlanet(this.universe.terran, time, camera);
    }
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
