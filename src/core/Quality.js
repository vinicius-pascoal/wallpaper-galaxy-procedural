export const QUALITY_PRESETS = Object.freeze({
  LOW: Object.freeze({ name: "LOW", internalHeight: 360, starCount: 1600, galaxyCount: 1400, nebulaCount: 1, systemCount: 1, maxFullDetailPlanets: 1, maxFullDetailBodies: 2, maxActiveShootingStars: 1 }),
  MEDIUM: Object.freeze({ name: "MEDIUM", internalHeight: 540, starCount: 3200, galaxyCount: 2600, nebulaCount: 1, systemCount: 2, maxFullDetailPlanets: 2, maxFullDetailBodies: 3, maxActiveShootingStars: 1 }),
  HIGH: Object.freeze({ name: "HIGH", internalHeight: 720, starCount: 6000, galaxyCount: 4200, nebulaCount: 2, systemCount: 3, maxFullDetailPlanets: 4, maxFullDetailBodies: 6, maxActiveShootingStars: 2 }),
  ULTRA: Object.freeze({ name: "ULTRA", internalHeight: 1080, starCount: 10000, galaxyCount: 6000, nebulaCount: 3, systemCount: 4, maxFullDetailPlanets: 6, maxFullDetailBodies: 8, maxActiveShootingStars: 2 }),
});

export const QUALITY_ORDER = Object.freeze(["LOW", "MEDIUM", "HIGH", "ULTRA"]);

export function resolveQuality(value) {
  const key = String(value ?? "HIGH").toUpperCase();
  return QUALITY_PRESETS[key] ?? QUALITY_PRESETS.HIGH;
}

export function qualityIndex(value) {
  return Math.max(0, QUALITY_ORDER.indexOf(String(value ?? "HIGH").toUpperCase()));
}

export function qualityAt(index) {
  return QUALITY_PRESETS[QUALITY_ORDER[Math.min(QUALITY_ORDER.length - 1, Math.max(0, Math.round(index)))]];
}

export function qualityForProperties(value, properties = {}) {
  const base = resolveQuality(value === "AUTO" ? "HIGH" : value);
  const pixelScale = { fine: 1.12, normal: 1, chunky: 0.84, verychunky: 0.68 }[String(properties.pixelScale ?? "normal").toLowerCase()] ?? 1;
  const starDensity = Math.min(1.5, Math.max(0.25, Number(properties.starDensity ?? 1)));
  const systemDensity = Math.min(1, Math.max(0, Number(properties.systemDensity ?? 1)));
  const scaleCount = (count, factor = 1) => Math.max(0, Math.round(count * factor));
  return Object.freeze({
    ...base,
    internalHeight: Math.max(240, Math.round(base.internalHeight * pixelScale)),
    starCount: scaleCount(base.starCount, starDensity),
    galaxyCount: scaleCount(base.galaxyCount, starDensity),
    systemCount: properties.solarSystemsEnabled === false ? 0 : Math.min(base.systemCount, Math.round(base.systemCount * systemDensity)),
    nebulaCount: properties.nebulaEnabled === false ? 0 : base.nebulaCount,
    maxFullDetailPlanets: properties.planetDetail === "low" ? Math.max(1, base.maxFullDetailPlanets - 1) : base.maxFullDetailPlanets,
    maxActiveShootingStars: properties.shootingStars === "off" ? 0 : base.maxActiveShootingStars,
  });
}
