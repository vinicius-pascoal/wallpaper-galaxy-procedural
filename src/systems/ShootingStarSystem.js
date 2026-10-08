import { hashSeed } from "../procedural/Hash.js";
import { SeededRandom } from "../procedural/SeededRandom.js";

export const SHOOTING_STAR_STRIDE = 6;

export class ShootingStarSystem {
  constructor(seed, maxActive = 3) {
    this.seed = seed >>> 0;
    this.maxActive = maxActive;
    this.pool = Array.from({ length: maxActive }, () => ({ active: false }));
    this.data = new Float32Array(maxActive * 2 * SHOOTING_STAR_STRIDE);
    this.activeCount = 0;
  }

  spawn(seed, startTime, options = {}) {
    const eventSeed = seed >>> 0;
    const random = new SeededRandom(eventSeed);
    const slot = this.pool.find((event) => !event.active);
    if (!slot) return false;
    const angle = options.angle ?? random.range(-0.6, 0.6);
    slot.active = true;
    slot.startTime = startTime;
    slot.duration = options.duration ?? random.range(0.65, 1.35);
    slot.speed = options.speed ?? random.range(0.32, 0.56);
    slot.brightness = options.brightness ?? random.range(0.62, 0.92);
    slot.depth = options.depth ?? 0.018;
    slot.x = options.x ?? random.range(-0.96, 0.84);
    slot.y = options.y ?? random.range(-0.54, 0.72);
    slot.directionX = Math.cos(angle);
    slot.directionY = Math.sin(angle);
    slot.length = options.length ?? random.range(0.08, 0.18);
    slot.color = options.color ?? [0.76, 0.9, 1.0];
    return true;
  }

  update(elapsed) {
    this.activeCount = 0;
    this.data.fill(0);
    for (const event of this.pool) {
      if (!event.active) continue;
      const age = elapsed - event.startTime;
      if (age >= event.duration) {
        event.active = false;
        continue;
      }
      const progress = age / event.duration;
      const headX = event.x + event.directionX * event.speed * age;
      const headY = event.y + event.directionY * event.speed * age;
      const tailX = headX - event.directionX * event.length;
      const tailY = headY - event.directionY * event.length;
      const fade = Math.sin(Math.min(1, progress) * Math.PI) * event.brightness;
      const offset = this.activeCount * 2 * SHOOTING_STAR_STRIDE;
      this._write(offset, tailX, tailY, fade * 0.08, event.color);
      this._write(offset + SHOOTING_STAR_STRIDE, headX, headY, fade, event.color);
      this.activeCount += 1;
    }
  }

  _write(offset, x, y, alpha, color) {
    this.data[offset] = x;
    this.data[offset + 1] = y;
    this.data[offset + 2] = alpha;
    this.data[offset + 3] = color[0];
    this.data[offset + 4] = color[1];
    this.data[offset + 5] = color[2];
  }
}
