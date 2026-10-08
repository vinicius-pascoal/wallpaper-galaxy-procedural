import { qualityAt, qualityIndex } from "./Quality.js";

export class PerformanceManager {
  constructor(initialQuality = "HIGH") {
    this.frameTime = 0;
    this.fps = 0;
    this.averageFrameTime = 0;
    this.slowFrameCount = 0;
    this.quality = String(initialQuality).toUpperCase();
    this.qualityIndex = qualityIndex(this.quality);
    this._windowTime = 0;
    this._windowFrames = 0;
    this._windowFrameTime = 0;
    this._badTime = 0;
    this._goodTime = 0;
  }

  update(delta, autoQuality = false) {
    this.frameTime = delta * 1000;
    this._windowTime += Math.max(0, delta);
    this._windowFrames += 1;
    this._windowFrameTime += this.frameTime;
    if (this.frameTime > 24) this.slowFrameCount += 1;
    if (this._windowTime < 1) return null;
    this.averageFrameTime = this._windowFrameTime / Math.max(1, this._windowFrames);
    this.fps = 1000 / Math.max(0.001, this.averageFrameTime);
    let changed = null;
    if (autoQuality) {
      if (this.fps < 50) {
        this._badTime += this._windowTime;
        this._goodTime = 0;
      } else if (this.fps > 58) {
        this._goodTime += this._windowTime;
        this._badTime = 0;
      } else {
        this._badTime = 0;
        this._goodTime = 0;
      }
      if (this._badTime >= 4 && this.qualityIndex > 0) {
        this.qualityIndex -= 1;
        changed = qualityAt(this.qualityIndex).name;
        this._badTime = 0;
        this._goodTime = 0;
      } else if (this._goodTime >= 12 && this.qualityIndex < 3) {
        this.qualityIndex += 1;
        changed = qualityAt(this.qualityIndex).name;
        this._goodTime = 0;
        this._badTime = 0;
      }
    }
    this._windowTime = 0;
    this._windowFrames = 0;
    this._windowFrameTime = 0;
    return changed;
  }

  setQuality(value) {
    this.quality = String(value).toUpperCase();
    this.qualityIndex = qualityIndex(this.quality);
    this._badTime = 0;
    this._goodTime = 0;
  }

  snapshot() {
    return {
      fps: this.fps,
      frameTime: this.frameTime,
      averageFrameTime: this.averageFrameTime,
      slowFrameCount: this.slowFrameCount,
      quality: this.quality,
    };
  }
}
