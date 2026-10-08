const BAND_NAMES = Object.freeze(["bass", "lowMid", "mid", "highMid", "treble"]);
const BAND_RANGES = Object.freeze([
  [0.00, 0.12],
  [0.12, 0.28],
  [0.28, 0.50],
  [0.50, 0.74],
  [0.74, 1.00],
]);

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : 0));
}

function readSpectrum(input) {
  if (input == null) return null;
  if (ArrayBuffer.isView(input) || Array.isArray(input)) return input;
  if (ArrayBuffer.isView(input.spectrum) || Array.isArray(input.spectrum)) return input.spectrum;
  if (ArrayBuffer.isView(input.data) || Array.isArray(input.data)) return input.data;
  return null;
}

export class WallpaperAudio {
  constructor(options = {}) {
    this.enabled = options.enabled !== false;
    this.testMode = options.testMode === true;
    this.attack = clamp(options.attack ?? 0.34, 0.02, 1);
    this.release = clamp(options.release ?? 0.08, 0.01, 1);
    this.threshold = clamp(options.threshold ?? 0.015, 0, 0.25);
    this.intensity = clamp(options.intensity ?? 1, 0, 2);
    this._bands = new Float32Array(BAND_NAMES.length);
    this._targets = new Float32Array(BAND_NAMES.length);
    this._scratch = new Float32Array(BAND_NAMES.length);
    this._spectrum = null;
    this._attached = false;
    this._listener = null;
    this._testTime = 0;
  }

  attach(target = globalThis) {
    if (this._attached || !target || typeof target.wallpaperRegisterAudioListener !== "function") return false;
    this._listener = (spectrum) => this.setSpectrum(spectrum);
    try {
      target.wallpaperRegisterAudioListener(this._listener);
      this._attached = true;
      return true;
    } catch (error) {
      console.warn("Wallpaper Engine audio indisponivel; usando fallback silencioso.", error);
      this._listener = null;
      return false;
    }
  }

  detach() {
    this._listener = null;
    this._attached = false;
  }

  setEnabled(enabled) {
    this.enabled = enabled === true;
    if (!this.enabled) this._targets.fill(0);
  }

  setIntensity(value) {
    this.intensity = clamp(value, 0, 2);
  }

  setSpectrum(input) {
    const spectrum = readSpectrum(input);
    this._spectrum = spectrum;
    if (!this.enabled || !spectrum?.length) {
      this._targets.fill(0);
      return this.getState();
    }
    for (let band = 0; band < BAND_RANGES.length; band += 1) {
      const start = Math.floor(BAND_RANGES[band][0] * spectrum.length);
      const end = Math.max(start + 1, Math.ceil(BAND_RANGES[band][1] * spectrum.length));
      let total = 0;
      let count = 0;
      for (let index = start; index < end && index < spectrum.length; index += 1) {
        total += clamp(Number(spectrum[index]), 0, 1);
        count += 1;
      }
      const average = count ? total / count : 0;
      const gated = Math.max(0, average - this.threshold) / Math.max(1 - this.threshold, 0.001);
      this._targets[band] = clamp(Math.pow(gated, 0.82) * this.intensity);
    }
    return this.getState();
  }

  update(delta = 0) {
    const safeDelta = clamp(delta, 0, 0.25);
    if (this.testMode) {
      this._testTime += safeDelta;
      this._targets[0] = clamp((Math.sin(this._testTime * 2.1) * 0.5 + 0.5) * 0.8);
      this._targets[2] = clamp((Math.sin(this._testTime * 1.1 + 1.5) * 0.5 + 0.5) * 0.52);
      this._targets[4] = clamp((Math.sin(this._testTime * 3.7 + 0.4) * 0.5 + 0.5) * 0.34);
    } else if (!this._spectrum || !this.enabled) {
      this._targets.fill(0);
    }
    const frameScale = Math.min(1, safeDelta * 60);
    for (let index = 0; index < this._bands.length; index += 1) {
      const target = this._targets[index];
      const current = this._bands[index];
      const coefficient = target > current ? 1 - Math.pow(1 - this.attack, frameScale) : 1 - Math.pow(1 - this.release, frameScale);
      this._bands[index] = current + (target - current) * coefficient;
    }
    return this.getState();
  }

  getState() {
    return {
      bass: this._bands[0],
      lowMid: this._bands[1],
      mid: this._bands[2],
      highMid: this._bands[3],
      treble: this._bands[4],
      intensity: this.intensity,
      active: this.enabled && this._bands.some((value) => value > 0.001),
    };
  }

  get bands() {
    for (let index = 0; index < this._scratch.length; index += 1) this._scratch[index] = this._bands[index];
    return this._scratch;
  }

  reset() {
    this._spectrum = null;
    this._bands.fill(0);
    this._targets.fill(0);
  }
}

export { BAND_NAMES };
