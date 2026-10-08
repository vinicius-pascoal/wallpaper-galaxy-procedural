export const DEFAULT_SEED = 583721;

const QUALITY_NAMES = new Set(["LOW", "MEDIUM", "HIGH", "ULTRA", "AUTO"]);
const FPS_VALUES = new Set([0, 30, 45, 60]);

export const DEFAULT_PROPERTIES = Object.freeze({
  preset: "Default",
  seed: DEFAULT_SEED,
  randomizeOnLoad: false,
  quality: "HIGH",
  fpsLimit: 60,
  pixelScale: "normal",
  galaxyType: "spiral",
  paletteMood: "default",
  galaxyRotationSpeed: 1,
  starDensity: 1,
  galaxyBrightness: 1,
  nebulaEnabled: true,
  nebulaIntensity: 1,
  galacticDust: true,
  solarSystemsEnabled: true,
  systemDensity: 1,
  orbitLines: false,
  planetDetail: "auto",
  moons: true,
  asteroidBelts: "auto",
  specialObjects: true,
  cameraMovement: true,
  cinematicDrift: true,
  mouseParallax: true,
  parallaxStrength: 1,
  cosmicEvents: true,
  cosmicActivity: "normal",
  shootingStars: "normal",
  comets: true,
  audioReactive: true,
  audioIntensity: 0.8,
  starReactivity: 1,
  nebulaReactivity: 1,
  particleReactivity: 1,
  motionIntensity: "normal",
  blackHole: "auto",
  deepBlackBackground: false,
});

export const LIVE_PROPERTIES = Object.freeze(new Set([
  "fpsLimit", "pixelScale", "galaxyRotationSpeed", "galaxyBrightness", "nebulaEnabled", "nebulaIntensity",
  "galacticDust", "orbitLines", "cameraMovement", "cinematicDrift", "mouseParallax", "parallaxStrength",
  "cosmicEvents", "cosmicActivity", "shootingStars", "audioReactive", "audioIntensity", "starReactivity",
  "nebulaReactivity", "particleReactivity", "motionIntensity", "deepBlackBackground",
]));

export const REGENERATE_PROPERTIES = Object.freeze(new Set([
  "preset", "seed", "quality", "galaxyType", "starDensity", "systemDensity", "planetDetail", "moons",
  "asteroidBelts", "specialObjects", "comets", "blackHole", "randomizeOnLoad",
]));

function valueOf(value) {
  return value && typeof value === "object" && "value" in value ? value.value : value;
}

function keyOf(value) {
  return String(value).replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
}

function getRaw(raw, name) {
  const direct = raw?.[name];
  if (direct !== undefined) return valueOf(direct);
  const wanted = keyOf(name);
  const found = Object.keys(raw ?? {}).find((key) => keyOf(key) === wanted);
  return found === undefined ? undefined : valueOf(raw[found]);
}

function first(raw, ...names) {
  for (const name of names) {
    const result = getRaw(raw, name);
    if (result !== undefined) return result;
  }
  return undefined;
}

function booleanValue(value, fallback) {
  if (value === undefined) return fallback;
  if (typeof value === "string") return ["true", "1", "on", "yes", "enabled"].includes(value.toLowerCase());
  return Boolean(value);
}

function numberValue(value, fallback, min, max) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
}

function enumValue(value, fallback, values) {
  const normalized = String(value ?? "").trim().toLowerCase();
  return values.includes(normalized) ? normalized : fallback;
}

export function normalizeSeed(value, fallback = DEFAULT_SEED) {
  const number = Number(value);
  return Number.isInteger(number) && number >= 0 ? number >>> 0 : fallback >>> 0;
}

export function normalizeProperties(raw = {}, base = DEFAULT_PROPERTIES) {
  const source = raw?.userProperties ?? raw;
  const result = { ...base };
  const aliases = {
    preset: ["preset"], seed: ["seed"], randomizeOnLoad: ["randomizeOnLoad", "randomizeSeed"],
    quality: ["quality"], fpsLimit: ["fps", "fpsLimit"], pixelScale: ["pixelScale"], galaxyType: ["galaxyType"], paletteMood: ["paletteMood"],
    galaxyRotationSpeed: ["galaxyRotationSpeed", "rotationSpeed"], starDensity: ["starDensity"], galaxyBrightness: ["galaxyBrightness"],
    nebulaEnabled: ["nebulaEnabled", "nebula"], nebulaIntensity: ["nebulaIntensity"], galacticDust: ["galacticDust", "dust"],
    solarSystemsEnabled: ["solarSystemsEnabled", "systemsEnabled"], systemDensity: ["systemDensity"], orbitLines: ["orbitLines", "orbits"],
    planetDetail: ["planetDetail"], moons: ["moons"], asteroidBelts: ["asteroidBelts"], specialObjects: ["specialObjects"],
    cameraMovement: ["cameraMovement"], cinematicDrift: ["cinematicDrift"], mouseParallax: ["mouseParallax"], parallaxStrength: ["parallaxStrength"],
    cosmicEvents: ["cosmicEvents"], cosmicActivity: ["cosmicActivity"], shootingStars: ["shootingStars"], comets: ["comets"],
    audioReactive: ["audioReactive"], audioIntensity: ["audioIntensity"], starReactivity: ["starReactivity"], nebulaReactivity: ["nebulaReactivity"],
    particleReactivity: ["particleReactivity"], motionIntensity: ["motionIntensity"], blackHole: ["blackHole"], deepBlackBackground: ["deepBlackBackground"],
  };
  for (const [name, names] of Object.entries(aliases)) {
    const incoming = first(source, ...names);
    if (incoming === undefined) continue;
    if (["nebulaEnabled", "galacticDust", "solarSystemsEnabled", "orbitLines", "moons", "specialObjects", "cameraMovement", "cinematicDrift", "mouseParallax", "cosmicEvents", "comets", "audioReactive", "deepBlackBackground", "randomizeOnLoad"].includes(name)) result[name] = booleanValue(incoming, result[name]);
    else if (["starDensity", "systemDensity", "galaxyBrightness", "nebulaIntensity", "parallaxStrength", "audioIntensity", "starReactivity", "nebulaReactivity", "particleReactivity"].includes(name)) result[name] = numberValue(incoming, result[name], 0, name === "audioIntensity" ? 2 : 1.5);
    else if (name === "galaxyRotationSpeed") result[name] = numberValue(incoming, result[name], 0, 3);
    else if (name === "seed") result[name] = normalizeSeed(incoming, result.seed);
    else if (name === "fpsLimit") {
      const fps = String(incoming).toLowerCase() === "unlimited" ? 0 : Number(incoming);
      result.fpsLimit = FPS_VALUES.has(fps) ? fps : result.fpsLimit;
    } else if (name === "quality") {
      const quality = String(incoming).toUpperCase(); result.quality = QUALITY_NAMES.has(quality) ? quality : result.quality;
    } else if (name === "preset") result.preset = String(incoming || result.preset);
    else if (name === "paletteMood") result.paletteMood = enumValue(incoming, result.paletteMood, ["default", "blue", "crimson", "frozen", "ancient", "nebula", "blackhole", "silent", "audio", "chaos"]);
    else if (name === "pixelScale") result.pixelScale = enumValue(incoming, result.pixelScale, ["fine", "normal", "chunky", "verychunky"]);
    else if (name === "galaxyType") result.galaxyType = enumValue(incoming, result.galaxyType, ["spiral", "auto"]);
    else if (name === "planetDetail") result.planetDetail = enumValue(incoming, result.planetDetail, ["auto", "low", "normal", "high"]);
    else if (["asteroidBelts", "blackHole"].includes(name)) result[name] = enumValue(incoming, result[name], ["auto", "on", "off"]);
    else if (["cosmicActivity", "shootingStars"].includes(name)) result[name] = enumValue(incoming, result[name], ["off", "low", "normal", "high", "rare", "frequent"]);
    else if (name === "motionIntensity") result.motionIntensity = enumValue(incoming, result.motionIntensity, ["off", "low", "normal", "high"]);
  }
  return result;
}

export function classifyPropertyChanges(previous, next) {
  const changed = Object.keys(next).filter((key) => previous?.[key] !== next[key]);
  return {
    changed,
    live: changed.filter((key) => LIVE_PROPERTIES.has(key)),
    regenerate: changed.filter((key) => REGENERATE_PROPERTIES.has(key)),
  };
}
