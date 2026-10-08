export class Camera {
  constructor() {
    this.position = { x: 0, y: 0 };
    this.zoom = 1;
    this.parallaxX = 0;
    this.parallaxY = 0;
    this.cinematicDrift = { x: 0, y: 0 };
    this._targetX = 0;
    this._targetY = 0;
    this._offset = new Float32Array(2);
    this.enabled = true;
    this.cinematicEnabled = true;
    this.parallaxEnabled = true;
    this.parallaxStrength = 1;
    this.motionIntensity = "normal";
  }

  update(delta, inputX, inputY, elapsed) {
    const motion = { off: 0, low: 0.35, normal: 1, high: 1.35 }[this.motionIntensity] ?? 1;
    this._targetX = this.enabled && this.parallaxEnabled ? inputX * 0.11 * this.parallaxStrength * motion : 0;
    this._targetY = this.enabled && this.parallaxEnabled ? inputY * 0.08 * this.parallaxStrength * motion : 0;
    const smoothing = 1 - Math.exp(-delta * 3.2);
    this.parallaxX += (this._targetX - this.parallaxX) * smoothing;
    this.parallaxY += (this._targetY - this.parallaxY) * smoothing;

    this.cinematicDrift.x = this.enabled && this.cinematicEnabled ? Math.sin(elapsed * 0.035) * 0.018 * motion : 0;
    this.cinematicDrift.y = this.enabled && this.cinematicEnabled ? Math.cos(elapsed * 0.027) * 0.012 * motion : 0;
  }

  applyConfig(config = {}) {
    this.enabled = config.cameraMovement !== false;
    this.cinematicEnabled = config.cinematicDrift !== false;
    this.parallaxEnabled = config.mouseParallax !== false;
    this.parallaxStrength = Math.min(1, Math.max(0, Number(config.parallaxStrength ?? 1)));
    this.motionIntensity = config.motionIntensity ?? "normal";
  }

  getOffset(target = this._offset) {
    target[0] = this.parallaxX + this.cinematicDrift.x;
    target[1] = this.parallaxY + this.cinematicDrift.y;
    return target;
  }
}
