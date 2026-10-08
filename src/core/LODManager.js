export const LOD_LEVEL = Object.freeze({
  POINT: 0,
  SIMPLE: 1,
  MEDIUM: 2,
  FULL: 3,
});

export class LODManager {
  constructor(maxFullDetailPlanets = 4, maxFullDetailBodies = maxFullDetailPlanets + 2) {
    this.counts = new Uint32Array(4);
    this.culled = 0;
    this.maxFullDetailPlanets = maxFullDetailPlanets;
    this.maxFullDetailBodies = maxFullDetailBodies;
    this.fullDetailPlanets = 0;
    this.fullDetailBodies = 0;
  }

  beginFrame() {
    this.counts.fill(0);
    this.culled = 0;
    this.fullDetailPlanets = 0;
    this.fullDetailBodies = 0;
  }

  classify(radiusNdc, internalHeight, isPlanet = true, priority = 0) {
    const screenRadius = radiusNdc * internalHeight * 0.5;
    if (screenRadius < 2) return LOD_LEVEL.POINT;
    if (screenRadius < 8) return LOD_LEVEL.SIMPLE;
    if (screenRadius < 24) return LOD_LEVEL.MEDIUM;
    const candidate = isPlanet || priority > 0;
    if (candidate && this.fullDetailBodies >= this.maxFullDetailBodies) return LOD_LEVEL.MEDIUM;
    if (candidate) this.fullDetailBodies += 1;
    if (isPlanet) this.fullDetailPlanets += 1;
    return LOD_LEVEL.FULL;
  }

  isVisible(position, radius, aspect) {
    return position[0] + radius > -1.05 && position[0] - radius < 1.05
      && position[1] + radius > -1.05 && position[1] - radius < 1.05
      && Math.abs(position[0]) < 1.0 + Math.max(0.05, aspect * 0.02);
  }

  record(level) {
    this.counts[level] += 1;
  }
}
