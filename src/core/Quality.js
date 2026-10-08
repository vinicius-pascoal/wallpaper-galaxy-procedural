export const QUALITY_PRESETS = Object.freeze({
  LOW: Object.freeze({ name: "LOW", internalHeight: 360, starCount: 4000, galaxyCount: 3200, nebulaCount: 1, systemCount: 1, maxFullDetailPlanets: 1, maxFullDetailBodies: 2, maxActiveShootingStars: 1 }),
  MEDIUM: Object.freeze({ name: "MEDIUM", internalHeight: 540, starCount: 8000, galaxyCount: 5200, nebulaCount: 2, systemCount: 2, maxFullDetailPlanets: 2, maxFullDetailBodies: 3, maxActiveShootingStars: 2 }),
  HIGH: Object.freeze({ name: "HIGH", internalHeight: 720, starCount: 15000, galaxyCount: 7600, nebulaCount: 3, systemCount: 3, maxFullDetailPlanets: 4, maxFullDetailBodies: 6, maxActiveShootingStars: 3 }),
  ULTRA: Object.freeze({ name: "ULTRA", internalHeight: 1080, starCount: 25000, galaxyCount: 10000, nebulaCount: 4, systemCount: 4, maxFullDetailPlanets: 6, maxFullDetailBodies: 8, maxActiveShootingStars: 3 }),
});

export function resolveQuality(value) {
  const key = String(value ?? "HIGH").toUpperCase();
  return QUALITY_PRESETS[key] ?? QUALITY_PRESETS.HIGH;
}
