const PRESETS = Object.freeze({
  Default: { nebulaIntensity: 1, starDensity: 1, systemDensity: 1, cosmicActivity: "normal", audioIntensity: 0.8, motionIntensity: "normal" },
  "Deep Blue": { nebulaIntensity: 0.9, galaxyBrightness: 0.86, cosmicActivity: "low", audioIntensity: 0.7, paletteMood: "blue" },
  "Crimson Void": { nebulaIntensity: 0.82, galaxyBrightness: 0.92, cosmicActivity: "low", audioIntensity: 0.65, paletteMood: "crimson" },
  "Frozen Cosmos": { nebulaIntensity: 0.72, galaxyBrightness: 0.86, starDensity: 0.84, cosmicActivity: "low", audioIntensity: 0.65, paletteMood: "frozen" },
  "Ancient Galaxy": { nebulaIntensity: 0.62, galaxyBrightness: 0.7, starDensity: 0.74, cosmicActivity: "low", audioIntensity: 0.45, motionIntensity: "low", paletteMood: "ancient" },
  "Nebula Fields": { nebulaIntensity: 1.35, galaxyBrightness: 0.9, starDensity: 0.82, systemDensity: 0.7, cosmicActivity: "normal", audioIntensity: 0.9, paletteMood: "nebula" },
  "Black Hole": { blackHole: "on", nebulaIntensity: 0.72, starDensity: 0.72, systemDensity: 0.58, cosmicActivity: "low", audioIntensity: 0.65, paletteMood: "blackhole" },
  "Silent Space": { nebulaIntensity: 0.35, galaxyBrightness: 0.58, starDensity: 0.52, systemDensity: 0.58, cosmicActivity: "off", shootingStars: "off", audioReactive: false, audioIntensity: 0.2, motionIntensity: "low", paletteMood: "silent" },
  "Audio Pulse": { nebulaIntensity: 1.05, galaxyBrightness: 0.96, cosmicActivity: "normal", audioReactive: true, audioIntensity: 1.25, starReactivity: 1.15, nebulaReactivity: 1.2, particleReactivity: 1.1, paletteMood: "audio" },
  Chaos: { nebulaIntensity: 1.4, galaxyBrightness: 1.05, starDensity: 1.12, systemDensity: 1, cosmicActivity: "high", shootingStars: "frequent", audioReactive: true, audioIntensity: 1.1, motionIntensity: "high", paletteMood: "chaos" },
});

export class PresetManager {
  static names() { return Object.keys(PRESETS); }

  static get(name = "Default") {
    return PRESETS[name] ?? PRESETS.Default;
  }

  static apply(name, current = {}) {
    const selected = Object.keys(PRESETS).includes(name) ? name : "Default";
    return { ...current, ...PRESETS[selected], preset: selected };
  }

  static isValid(name) { return Object.prototype.hasOwnProperty.call(PRESETS, name); }
}

export { PRESETS };
