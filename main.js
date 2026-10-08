import { Engine } from "./src/core/Engine.js";
import { QUALITY_PRESETS, qualityForProperties } from "./src/core/Quality.js";
import { DEFAULT_SEED, normalizeProperties } from "./src/wallpaper/WallpaperProperties.js";
import { WallpaperState } from "./src/wallpaper/WallpaperState.js";
import { PresetManager } from "./src/wallpaper/PresetManager.js";

const canvas = document.getElementById("wallpaper-canvas");
const loading = document.getElementById("loading");
const error = document.getElementById("error");
const debug = document.getElementById("debug");
const query = new URLSearchParams(window.location.search);

function queryProperties() {
  const requestedSeed = Number.parseInt(query.get("seed") ?? "", 10);
  return normalizeProperties({
    seed: Number.isFinite(requestedSeed) ? requestedSeed : DEFAULT_SEED,
    quality: query.get("quality") ?? "HIGH",
    fpsLimit: query.get("fps") ?? 60,
    orbitLines: query.get("orbits") === "true",
    audioReactive: query.has("audioReactive") ? query.get("audioReactive") === "true" : true,
    nebulaEnabled: query.has("nebula") ? query.get("nebula") !== "false" : true,
  });
}

let config = queryProperties();
if (query.has("preset")) config = normalizeProperties(PresetManager.apply(query.get("preset"), config));
if (config.randomizeOnLoad) config.seed = (globalThis.crypto?.getRandomValues?.(new Uint32Array(1))[0] ?? Date.now()) >>> 0;

const state = new WallpaperState(config);
const planetGallery = query.get("planetGallery") === "true";
const specialGallery = query.get("specialGallery") === "true" || query.get("blackHoleGallery") === "true";
const requestedQuality = planetGallery || specialGallery ? "HIGH" : config.quality;
const quality = qualityForProperties(requestedQuality === "AUTO" ? "HIGH" : requestedQuality, config);
const debugEnabled = query.get("debug") === "true" || planetGallery || specialGallery;
const view = query.get("view") ?? "all";
const referencePalette = query.has("referencePalette") ? query.get("referencePalette") === "true" : planetGallery;
const referenceParameters = query.has("referenceParams") ? query.get("referenceParams") === "true" : planetGallery;
const animationDebugSpeed = Number.parseFloat(query.get("animationDebugSpeed") ?? "1");
const audioTest = query.get("audioTest") === "true";

let engine = null;
let pendingProperties = null;

async function applyExternalProperties(properties) {
  const current = state.toJSON();
  let next = normalizeProperties(properties, current);
  if (next.preset !== current.preset) next = normalizeProperties(PresetManager.apply(next.preset, next));
  state.update(next);
  if (engine) await engine.applyProperties(state.toJSON());
  else pendingProperties = state.toJSON();
}

window.wallpaperPropertyListener = {
  applyUserProperties: (properties) => applyExternalProperties(properties),
};

async function boot() {
  try {
    engine = await Engine.create(canvas, {
      seed: config.seed,
      quality,
      config,
      fpsLimit: config.fpsLimit,
      debug: debugEnabled,
      debugElement: debug,
      view,
      showOrbits: config.orbitLines,
      planetGallery,
      specialGallery,
      planetLayer: query.get("blackHoleLayer") ?? query.get("planetLayer") ?? "composite",
      referencePalette,
      referenceParameters,
      animationDebugSpeed: Number.isFinite(animationDebugSpeed) ? animationDebugSpeed : 1,
      audioTest,
    });
    loading.hidden = true;
    if (pendingProperties) await engine.applyProperties(pendingProperties);
    engine.start();
  } catch (cause) {
    loading.hidden = true;
    error.hidden = false;
    error.textContent = `Nao foi possivel inicializar o wallpaper.\n${cause.message}`;
    console.error(cause);
  }
}

if (!QUALITY_PRESETS[quality.name]) console.warn("Preset de qualidade invalido; usando HIGH.");
boot();

export { DEFAULT_SEED };
