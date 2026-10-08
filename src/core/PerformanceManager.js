export class PerformanceManager {
  constructor() {
    this.frameTime = 0;
  }

  update(delta) {
    this.frameTime = delta * 1000;
  }
}
