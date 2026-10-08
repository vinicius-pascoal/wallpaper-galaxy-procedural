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
  }

  update(delta, inputX, inputY, elapsed) {
    this._targetX = inputX * 0.11;
    this._targetY = inputY * 0.08;
    const smoothing = 1 - Math.exp(-delta * 3.2);
    this.parallaxX += (this._targetX - this.parallaxX) * smoothing;
    this.parallaxY += (this._targetY - this.parallaxY) * smoothing;

    this.cinematicDrift.x = Math.sin(elapsed * 0.035) * 0.018;
    this.cinematicDrift.y = Math.cos(elapsed * 0.027) * 0.012;
  }

  getOffset(target = this._offset) {
    target[0] = this.parallaxX + this.cinematicDrift.x;
    target[1] = this.parallaxY + this.cinematicDrift.y;
    return target;
  }
}
