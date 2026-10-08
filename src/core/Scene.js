import { Universe } from "./Universe.js";

export class Scene {
  constructor(seed, quality, view = "all") {
    this.view = view;
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
    if (showStars) {
      renderer.renderPoints(this.universe.starLayer, renderer.starsProgram, time, camera, 0);
    }
    if (showGalaxy) {
      renderer.renderPoints(this.universe.galaxyLayer, renderer.galaxyProgram, time, camera, this.universe.galaxy.rotationSpeed);
    }
  }

  get stats() {
    return this.universe.stats;
  }
}
