import { Camera } from "./Camera.js";
import { PerformanceManager } from "./PerformanceManager.js";
import { Renderer } from "./Renderer.js";
import { Scene } from "./Scene.js";
import { Time } from "./Time.js";
import { MouseParallax } from "../input/MouseParallax.js";
import { WallpaperAudio } from "../wallpaper/WallpaperAudio.js";
import { classifyPropertyChanges, normalizeProperties } from "../wallpaper/WallpaperProperties.js";
import { qualityForProperties } from "./Quality.js";

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
    this.config = options.config ?? {};
    this.performance = new PerformanceManager(options.quality.name);
    this.audio = options.audio ?? new WallpaperAudio({ enabled: this.config.audioReactive !== false, intensity: this.config.audioIntensity ?? 1, testMode: options.audioTest === true });
    this.mouse = new MouseParallax(canvas);
    this.renderer = new Renderer(canvas, options.quality, options);
    this.scene = new Scene(options.seed, options.quality, options.view, options.showOrbits, { ...options, config: this.config });
    this.running = false;
    this.paused = false;
    this._rafId = 0;
    this._lastFrameTimestamp = null;
    this._resizeRaf = 0;
    this._activeQualityName = options.quality.name;
    this._boundFrame = this._frame.bind(this);
    this._boundResize = this._resize.bind(this);
    this._boundKeyDown = this._onKeyDown.bind(this);
    this._boundVisibility = this._onVisibilityChange.bind(this);
    this._boundContextLost = this._onContextLost.bind(this);
    this._boundContextRestored = this._onContextRestored.bind(this);
  }

  async _initialize() {
    await this.renderer.initialize();
    this.scene.initialize(this.renderer);
    window.addEventListener("resize", this._boundResize, { passive: true });
    document.addEventListener("visibilitychange", this._boundVisibility, { passive: true });
    this.canvas.addEventListener("webglcontextlost", this._boundContextLost, { passive: false });
    this.canvas.addEventListener("webglcontextrestored", this._boundContextRestored, { passive: true });
    this.audio.attach(window);
    this.camera.applyConfig(this.config);
    if (this.options.debug) {
      window.addEventListener("keydown", this._boundKeyDown, { passive: true });
    }
    this._resize();
  }

  start() {
    if (this.running || this.paused) {
      return;
    }
    if (document.visibilityState === "hidden") {
      this.paused = true;
      return;
    }
    this.running = true;
    this._lastFrameTimestamp = null;
    this.time.reset(typeof performance !== "undefined" ? performance.now() : 0);
    this._rafId = requestAnimationFrame(this._boundFrame);
  }

  _resize() {
    if (this._resizeRaf) return;
    this._resizeRaf = requestAnimationFrame(() => {
      this._resizeRaf = 0;
      if (!this.paused) this.renderer.resize();
    });
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

    const fpsLimit = Number(this.config.fpsLimit ?? this.options.fpsLimit ?? 60);
    const frameInterval = fpsLimit > 0 ? 1000 / fpsLimit : 0;
    if (frameInterval && this._lastFrameTimestamp !== null && timestamp - this._lastFrameTimestamp < frameInterval) {
      this._rafId = requestAnimationFrame(this._boundFrame);
      return;
    }
    this._lastFrameTimestamp = timestamp;

    this.time.update(timestamp);
    this.audio.update(this.time.delta);
    this.config.audioState = this.audio.getState();
    const adaptiveQuality = this.performance.update(this.time.delta, this.config.quality === "AUTO");
    if (adaptiveQuality) this._regenerate({ ...this.config }, adaptiveQuality);
    this.camera.update(this.time.delta, this.mouse.x, this.mouse.y, this.time.elapsed);
    this.scene.update(this.time);

    this.renderer.beginFrame();
    this.scene.render(this.renderer, this.camera, this.time);
    this.renderer.endFrame();

    if (this.options.debug) {
      this._updateDebug();
    }
    this._rafId = requestAnimationFrame(this._boundFrame);
  }

  _updateDebug() {
    const stats = this.scene.stats;
    const renderer = this.renderer;
    this.options.debugElement.textContent = [
      `FPS              ${this.time.fps.toFixed(1)}`,
      `Frame time       ${this.performance.frameTime.toFixed(2)} ms`,
      `Average frame    ${this.performance.averageFrameTime.toFixed(2)} ms`,
      `Internal         ${renderer.internalWidth}×${renderer.internalHeight}`,
      `Shader time      ${this.time.shaderElapsed.toFixed(2)}`,
      `Stars            ${stats.starCount}`,
      `Galaxy stars     ${stats.galaxyCount}`,
      `Nebulae          ${stats.nebulaCount}`,
      `Systems          ${stats.systemCount}`,
      `Planets          ${stats.planetCount}`,
      `Moons            ${stats.moonCount}`,
      `Asteroid belts   ${stats.asteroidBeltCount}`,
      `Asteroids         ${stats.asteroidCount}`,
      `LOD              ${stats.lodCounts[0]}/${stats.lodCounts[1]}/${stats.lodCounts[2]}/${stats.lodCounts[3]}`,
      `Culled bodies     ${stats.culledBodies}`,
      `Terran seed      ${stats.terranSeed}`,
      `Terran radius    ${stats.terranRadius.toFixed(3)}`,
      `FBM octaves      ${stats.fbmOctaves}`,
      `Terran spin      ${stats.terranRotationSpeed.toFixed(4)}`,
      `Cloud spin       ${stats.terranCloudRotationSpeed.toFixed(4)}`,
      `Draw calls       ${renderer.drawCalls}`,
      `Star draws       ${renderer.starDrawCalls}`,
      `Planet draws     ${renderer.planetDrawCalls}`,
      `Moon draws       ${renderer.moonDrawCalls}`,
      `Asteroid draws   ${renderer.asteroidDrawCalls}/${renderer.asteroidBeltDrawCalls}`,
      `Black holes      ${stats.blackHoleCount}`,
      `Comets           ${stats.cometCount}`,
      `Pulsars          ${stats.pulsarCount}`,
      `Binary systems   ${stats.binarySystemCount}`,
      `Shooting stars   ${stats.activeShootingStars}`,
      `Cosmic activity  ${stats.cosmicActivity.toFixed(2)}`,
      `Next event       ${stats.nextEventType}`,
      `Active event     ${stats.activeRareEvent}`,
      `Special draws    ${renderer.blackHoleDrawCalls}/${renderer.cometDrawCalls}/${renderer.pulsarDrawCalls}/${renderer.shootingStarDrawCalls}`,
      `Special LOD       BH ${stats.blackHoleLod.join("/")} C ${stats.cometLod.join("/")} P ${stats.pulsarLod.join("/")}`,
      `Quality          ${this._activeQualityName}${this.config.quality === "AUTO" ? " (Auto)" : ""}`,
      `Seed             ${this.options.seed >>> 0}`,
      `Audio Reactive   ${this.config.audioReactive === false ? "OFF" : "ON"}`,
      `Audio bands      ${this._audioBar("Bass", this.config.audioState?.bass)} ${this._audioBar("Low", this.config.audioState?.lowMid)} ${this._audioBar("Mid", this.config.audioState?.mid)} ${this._audioBar("High", this.config.audioState?.highMid)} ${this._audioBar("Treble", this.config.audioState?.treble)}`,
      `Audio intensity  ${(this.config.audioIntensity ?? 0).toFixed(2)}`,
      ...(this.options.planetGallery ? [`Gallery          ${this.scene.planetLayer}`, `Reference pal.   ${this.options.referencePalette ? "on" : "off"}`, `Reference params. ${this.options.referenceParameters ? "on" : "off"}`] : []),
      ...(this.options.specialGallery ? [`Special gallery  ${this.scene.planetLayer}`] : []),
    ].join("\n");
    this.options.debugElement.hidden = false;
  }

  _audioBar(name, value = 0) {
    const filled = Math.round(Math.min(1, Math.max(0, value ?? 0)) * 8);
    return `${name}:${"█".repeat(filled)}${"·".repeat(8 - filled)}`;
  }

  _onVisibilityChange() {
    if (document.visibilityState === "hidden") this.pause();
    else this.resume();
  }

  _onContextLost(event) {
    event.preventDefault();
    this.renderer.handleContextLost();
    this.pause();
  }

  async _onContextRestored() {
    try {
      await this.renderer.initialize();
      this.scene.initialize(this.renderer);
      this.resume();
    } catch (error) {
      this.options.debug && console.error("Falha ao restaurar contexto WebGL", error);
    }
  }

  pause() {
    if (!this.running && this.paused) return;
    this.running = false;
    this.paused = true;
    if (this._rafId) cancelAnimationFrame(this._rafId);
    this._rafId = 0;
    this.time.reset();
    this.audio.reset();
  }

  resume() {
    if (!this.paused || document.visibilityState === "hidden") return;
    this.paused = false;
    this.start();
  }

  async applyProperties(nextConfig) {
    const next = normalizeProperties(nextConfig, this.config);
    const changes = classifyPropertyChanges(this.config, next);
    if (!changes.changed.length) return changes;
    this.config = next;
    this.options.config = next;
    this.audio.setEnabled(next.audioReactive !== false);
    this.audio.setIntensity(next.audioIntensity);
    this.camera.applyConfig(next);
    this.renderer.applyOptions({ config: next });
    this.scene.applyConfig(next);
    if (changes.regenerate.length || changes.changed.includes("pixelScale")) await this._regenerate(next);
    return changes;
  }

  async _regenerate(config, forcedQuality = null) {
    const wasRunning = this.running;
    this.running = false;
    if (this._rafId) cancelAnimationFrame(this._rafId);
    const qualityName = forcedQuality ?? (config.quality === "AUTO" ? this._activeQualityName : config.quality);
    const quality = qualityForProperties(qualityName, config);
    this._activeQualityName = quality.name;
    this.performance.setQuality(quality.name);
    this.renderer.quality = quality;
    this.renderer.resize();
    this.scene.regenerate(config.seed, quality, this.renderer, config);
    this.options.seed = config.seed;
    this.options.quality = quality;
    if (wasRunning && !this.paused) this.start();
  }

  destroy() {
    this.pause();
    window.removeEventListener("resize", this._boundResize);
    document.removeEventListener("visibilitychange", this._boundVisibility);
    this.canvas.removeEventListener("webglcontextlost", this._boundContextLost);
    this.canvas.removeEventListener("webglcontextrestored", this._boundContextRestored);
    if (this.options.debug) window.removeEventListener("keydown", this._boundKeyDown);
    this.audio.detach();
    this.mouse.dispose?.();
    this.scene.universe.dispose(this.renderer);
    this.renderer.dispose();
  }
}
