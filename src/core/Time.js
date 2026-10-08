export class Time {
  constructor() {
    this.elapsed = 0;
    this.delta = 0;
    this.fps = 0;
    this._lastTimestamp = 0;
    this._fpsAccumulator = 0;
    this._fpsFrames = 0;
  }

  update(timestamp) {
    if (this._lastTimestamp === 0) {
      this._lastTimestamp = timestamp;
    }

    this.delta = Math.min(Math.max((timestamp - this._lastTimestamp) * 0.001, 0), 0.05);
    this._lastTimestamp = timestamp;
    this.elapsed += this.delta;

    this._fpsAccumulator += this.delta;
    this._fpsFrames += 1;
    if (this._fpsAccumulator >= 0.5) {
      this.fps = this._fpsFrames / this._fpsAccumulator;
      this._fpsAccumulator = 0;
      this._fpsFrames = 0;
    }
  }
}
