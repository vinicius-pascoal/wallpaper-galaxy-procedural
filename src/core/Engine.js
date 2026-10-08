import { Camera } from "./Camera.js";
import { PerformanceManager } from "./PerformanceManager.js";
import { Renderer } from "./Renderer.js";
import { Scene } from "./Scene.js";
import { Time } from "./Time.js";
import { MouseParallax } from "../input/MouseParallax.js";

export class Engine {
  static async create(canvas, options) {
    const engine = new Engine(canvas, options);
    await engine._initialize();
    return engine;
  }

  constructor(canvas, options) {
    this.canvas = canvas;
    this.options = options;
    this.time = new Time();
    this.camera = new Camera();
    this.performance = new PerformanceManager();
    this.mouse = new MouseParallax(canvas);
    this.renderer = new Renderer(canvas, options.quality);
    this.scene = new Scene(options.seed, options.quality, options.view);
    this.running = false;
    this._boundFrame = this._frame.bind(this);
    this._boundResize = this._resize.bind(this);
    this._boundKeyDown = this._onKeyDown.bind(this);
  }

  async _initialize() {
    await this.renderer.initialize();
    this.scene.initialize(this.renderer);
    window.addEventListener("resize", this._boundResize, { passive: true });
    if (this.options.debug) {
      window.addEventListener("keydown", this._boundKeyDown, { passive: true });
    }
    this._resize();
  }

  start() {
    if (this.running) {
      return;
    }
    this.running = true;
    requestAnimationFrame(this._boundFrame);
  }

  _resize() {
    this.renderer.resize();
  }

  _onKeyDown(event) {
    if (event.key.toLowerCase() === "n") {
      this.scene.toggleNebulae();
    } else if (event.key.toLowerCase() === "p") {
      this.scene.togglePlanet();
    }
  }

  _frame(timestamp) {
    if (!this.running) {
      return;
    }

    this.time.update(timestamp);
    this.performance.update(this.time.delta);
    this.camera.update(this.time.delta, this.mouse.x, this.mouse.y, this.time.elapsed);
    this.scene.update(this.time);

    this.renderer.beginFrame();
    this.scene.render(this.renderer, this.camera, this.time);
    this.renderer.endFrame();

    if (this.options.debug) {
      this._updateDebug();
    }
    requestAnimationFrame(this._boundFrame);
  }

  _updateDebug() {
    const stats = this.scene.stats;
    const renderer = this.renderer;
    this.options.debugElement.textContent = [
      `FPS              ${this.time.fps.toFixed(1)}`,
      `Frame time       ${this.performance.frameTime.toFixed(2)} ms`,
      `Internal         ${renderer.internalWidth}×${renderer.internalHeight}`,
      `Stars            ${stats.starCount}`,
      `Galaxy stars     ${stats.galaxyCount}`,
      `Nebulae          ${stats.nebulaCount}`,
      `Systems          ${stats.systemCount}`,
      `Planets          ${stats.planetCount}`,
      `Terran seed      ${stats.terranSeed}`,
      `Terran radius    ${stats.terranRadius.toFixed(3)}`,
      `FBM octaves      ${stats.fbmOctaves}`,
      `Draw calls       ${renderer.drawCalls}`,
      `Quality          ${this.options.quality.name}`,
      `Seed             ${this.options.seed >>> 0}`,
    ].join("\n");
    this.options.debugElement.hidden = false;
  }
}
