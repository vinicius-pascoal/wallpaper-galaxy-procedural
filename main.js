import { Engine } from "./src/core/Engine.js";
import { QUALITY_PRESETS, resolveQuality } from "./src/core/Quality.js";

export const DEFAULT_SEED = 583721;

const canvas = document.getElementById("wallpaper-canvas");
const loading = document.getElementById("loading");
const error = document.getElementById("error");
const debug = document.getElementById("debug");
const query = new URLSearchParams(window.location.search);

const requestedSeed = Number.parseInt(query.get("seed") ?? "", 10);
const seed = Number.isFinite(requestedSeed) ? requestedSeed >>> 0 : DEFAULT_SEED;
const planetGallery = query.get("planetGallery") === "true";
const specialGallery = query.get("specialGallery") === "true" || query.get("blackHoleGallery") === "true";
const requestedQuality = query.get("quality") ?? (planetGallery || specialGallery ? "high" : undefined);
const quality = (planetGallery || specialGallery) && String(requestedQuality).toLowerCase() !== "ultra" ? resolveQuality("high") : resolveQuality(requestedQuality);
const debugEnabled = query.get("debug") === "true" || planetGallery || specialGallery;
const view = query.get("view") ?? "all";
const referencePalette = query.has("referencePalette") ? query.get("referencePalette") === "true" : planetGallery;
const referenceParameters = query.has("referenceParams") ? query.get("referenceParams") === "true" : planetGallery;
const animationDebugSpeed = Number.parseFloat(query.get("animationDebugSpeed") ?? "1");

async function boot() {
  try {
    const engine = await Engine.create(canvas, {
      seed,
      quality,
      debug: debugEnabled,
      view,
      showOrbits: query.get("orbits") === "true",
      planetGallery,
      specialGallery,
      planetLayer: query.get("blackHoleLayer") ?? query.get("planetLayer") ?? "composite",
      referencePalette,
      referenceParameters,
      animationDebugSpeed: Number.isFinite(animationDebugSpeed) ? animationDebugSpeed : 1,
      debugElement: debug,
    });

    loading.hidden = true;
    engine.start();
  } catch (cause) {
    loading.hidden = true;
    error.hidden = false;
    error.textContent = `Não foi possível inicializar o wallpaper.\n${cause.message}`;
    console.error(cause);
  }
}

if (!Object.values(QUALITY_PRESETS).includes(quality)) {
  console.warn("Preset de qualidade inválido; usando HIGH.");
}

boot();
