export const QUALITY_PRESETS = Object.freeze({
  LOW: Object.freeze({ name: "LOW", internalHeight: 360, starCount: 4000, galaxyCount: 3200 }),
  MEDIUM: Object.freeze({ name: "MEDIUM", internalHeight: 540, starCount: 8000, galaxyCount: 5200 }),
  HIGH: Object.freeze({ name: "HIGH", internalHeight: 720, starCount: 15000, galaxyCount: 7600 }),
  ULTRA: Object.freeze({ name: "ULTRA", internalHeight: 1080, starCount: 25000, galaxyCount: 10000 }),
});

export function resolveQuality(value) {
  const key = String(value ?? "HIGH").toUpperCase();
  return QUALITY_PRESETS[key] ?? QUALITY_PRESETS.HIGH;
}
