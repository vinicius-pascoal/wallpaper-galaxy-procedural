export const QUALITY_PRESETS = Object.freeze({
  LOW: Object.freeze({ name: "LOW", internalHeight: 360, starCount: 1600, galaxyCount: 1400, nebulaCount: 1, systemCount: 1, maxFullDetailPlanets: 1, maxFullDetailBodies: 2, maxActiveShootingStars: 1 }),
  MEDIUM: Object.freeze({ name: "MEDIUM", internalHeight: 540, starCount: 3200, galaxyCount: 2600, nebulaCount: 1, systemCount: 2, maxFullDetailPlanets: 2, maxFullDetailBodies: 3, maxActiveShootingStars: 1 }),
  HIGH: Object.freeze({ name: "HIGH", internalHeight: 720, starCount: 6000, galaxyCount: 4200, nebulaCount: 2, systemCount: 3, maxFullDetailPlanets: 4, maxFullDetailBodies: 6, maxActiveShootingStars: 2 }),
  ULTRA: Object.freeze({ name: "ULTRA", internalHeight: 1080, starCount: 10000, galaxyCount: 6000, nebulaCount: 3, systemCount: 4, maxFullDetailPlanets: 6, maxFullDetailBodies: 8, maxActiveShootingStars: 2 }),
});

export function resolveQuality(value) {
  const key = String(value ?? "HIGH").toUpperCase();
  return QUALITY_PRESETS[key] ?? QUALITY_PRESETS.HIGH;
}
