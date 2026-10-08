import { hashSeed } from "../procedural/Hash.js";
import { hash01 } from "../procedural/Hash.js";
import { SeededRandom } from "../procedural/SeededRandom.js";
import { ShootingStarSystem } from "./ShootingStarSystem.js";

export class CosmicEventSystem {
  constructor(seed, quality, options = {}) {
    this.seed = seed >>> 0;
    this.quality = quality;
    this.enabled = options.cosmicEvents !== false;
    this.activityScale = { off: 0, low: 0.45, normal: 1, high: 1.45 }[options.cosmicActivity] ?? 1;
    this.shootingStarMode = options.shootingStars ?? "normal";
    this.cosmicActivity = 0.18 + hash01(this.seed, "cosmic-activity") * 0.64;
    this.shootingStars = new ShootingStarSystem(hashSeed(this.seed, "shooting-stars"), quality.maxActiveShootingStars ?? 3);
    this.eventIndex = 0;
    this.nextEventTime = 20 + (1 - this.cosmicActivity) * 70;
    this.cooldownUntil = 0;
    this.activeEvent = "none";
    this.activeUntil = 0;
    this.nextEventType = "shooting-star";
    this.totalEvents = 0;
  }

  update(time, universe) {
    const elapsed = time.elapsed;
    if (!this.enabled || this.activityScale <= 0 || this.shootingStarMode === "off") {
      this.shootingStars.clear();
      return;
    }
    this.shootingStars.update(elapsed);
    if (this.activeEvent === "stellar-flare" && elapsed < this.activeUntil) {
      const phase = Math.min(1, Math.max(0, (elapsed - (this.activeUntil - 3.5)) / 3.5));
      const envelope = phase < 0.22 ? phase / 0.22 : 1 - ((phase - 0.22) / 0.78);
      for (const system of universe.systems) {
        for (const star of system.stars) {
          if (star.eventFlareBoost > 0) star.eventFlareBoost = Math.max(0, star.eventFlareBoost * Math.max(0.02, envelope));
        }
      }
    }
    if (this.activeEvent !== "none" && elapsed >= this.activeUntil) {
      this.activeEvent = "none";
      for (const system of universe.systems) {
        for (const star of system.stars) star.eventFlareBoost = 0;
      }
      universe.nebula.eventPulse = 0;
    }
    if (elapsed < this.nextEventTime || elapsed < this.cooldownUntil) return;
    const eventSeed = hashSeed(this.seed, `event-${this.eventIndex}`);
    const random = new SeededRandom(eventSeed);
    const roll = random.next();
    const duration = roll < 0.55 ? random.range(0.7, 1.5) : roll < 0.75 ? random.range(2, 5) : random.range(3, 7);
    if (roll < 0.55) {
      this._spawnShootingStar(eventSeed, elapsed, { brightness: this.shootingStarMode === "frequent" ? 0.72 : undefined });
      this.activeEvent = "shooting-star";
    } else if (roll < 0.75) {
      this._triggerFlare(universe, random, elapsed, duration);
      this.activeEvent = "stellar-flare";
    } else if (roll < 0.9) {
      universe.nebula.eventPulse = 0.14 + this.cosmicActivity * 0.1;
      this.activeEvent = "nebula-pulse";
    } else {
      const count = Math.min(this.shootingStarMode === "frequent" ? 3 : 2, random.int(3, 9));
      for (let index = 0; index < count; index += 1) {
        this._spawnShootingStar(hashSeed(eventSeed, `meteor-${index}`), elapsed + index * 0.18, { duration: 0.8, brightness: 0.54 });
      }
      this.activeEvent = "meteor-shower";
    }
    this.totalEvents += 1;
    this.activeUntil = elapsed + duration;
    this.cooldownUntil = elapsed + Math.max(10, (20 - this.cosmicActivity * 7) / this.activityScale);
    this.eventIndex += 1;
    this.nextEventTime = elapsed + (20 + (1 - this.cosmicActivity) * 70 + random.range(0, 18)) / this.activityScale;
    this.nextEventType = roll < 0.55 ? "shooting-star" : roll < 0.75 ? "stellar-flare" : roll < 0.9 ? "nebula-pulse" : "meteor-shower";
  }

  _spawnShootingStar(seed, startTime, options = {}) {
    this.shootingStars.spawn(seed, startTime, options);
  }

  setConfig(options = {}) {
    this.enabled = options.cosmicEvents !== false;
    this.activityScale = { off: 0, low: 0.45, normal: 1, high: 1.45 }[options.cosmicActivity] ?? 1;
    this.shootingStarMode = options.shootingStars ?? "normal";
    if (!this.enabled || this.activityScale <= 0 || this.shootingStarMode === "off") this.shootingStars.clear();
  }

  _triggerFlare(universe, random, elapsed, duration) {
    const systems = universe.systems;
    if (!systems.length) return;
    const system = systems[random.int(0, systems.length)];
    for (const star of system.stars) star.eventFlareBoost = 0;
    const star = system.stars[random.int(0, system.stars.length)];
    star.eventFlareBoost = 0.14 + random.range(0, 0.12);
    star.eventFlareStart = elapsed;
    star.eventFlareDuration = duration;
  }

  get stats() {
    return {
      cosmicActivity: this.cosmicActivity,
      totalEvents: this.totalEvents,
      activeShootingStars: this.shootingStars.activeCount,
      nextEventTime: this.nextEventTime,
      nextEventType: this.nextEventType,
      activeEvent: this.activeEvent,
      cooldown: Math.max(0, this.cooldownUntil),
    };
  }
}
