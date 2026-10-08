import { hashSeed } from "./Hash.js";
import { SeededRandom } from "./SeededRandom.js";

function hsvToRgb(hue, saturation, value) {
  const h = ((hue % 1) + 1) % 1;
  const sector = h * 6;
  const index = Math.floor(sector);
  const fraction = sector - index;
  const p = value * (1 - saturation);
  const q = value * (1 - saturation * fraction);
  const t = value * (1 - saturation * (1 - fraction));
  const colors = [
    [value, t, p],
    [q, value, p],
    [p, value, t],
    [p, q, value],
    [t, p, value],
    [value, p, q],
  ];
  return new Float32Array(colors[index % 6]);
}

function scaleColor(color, amount) {
  return new Float32Array([color[0] * amount, color[1] * amount, color[2] * amount]);
}

export class PaletteGenerator {
  static terran(seed) {
    const random = new SeededRandom(hashSeed(seed, "terran-palette"));
    const oceanHue = random.range(0.54, 0.62);
    const landHue = random.range(0.25, 0.39);
    const oceanDark = hsvToRgb(oceanHue, 0.72, random.range(0.18, 0.28));
    const oceanLight = hsvToRgb(oceanHue + 0.015, 0.62, random.range(0.36, 0.52));
    const landDark = hsvToRgb(landHue, 0.62, random.range(0.22, 0.31));
    const landBase = hsvToRgb(landHue + 0.015, 0.58, random.range(0.42, 0.55));
    const landLight = hsvToRgb(landHue - 0.015, 0.46, random.range(0.62, 0.76));
    const cloudShadow = hsvToRgb(0.58, 0.2, 0.62);
    const cloudLight = hsvToRgb(0.58, 0.08, 0.98);
    const atmosphere = hsvToRgb(oceanHue + 0.02, 0.66, 0.82);
    return { oceanDark, oceanLight, landDark, landBase, landLight, cloudShadow, cloudLight, atmosphere };
  }

  static nebula(seed) {
    const random = new SeededRandom(hashSeed(seed, "nebula-palette"));
    const hueFamilies = [0.67, 0.82, 0.04, 0.56, 0.38, 0.94];
    const hue = hueFamilies[random.int(0, hueFamilies.length)] + random.range(-0.025, 0.025);
    const secondary = hue + random.range(0.035, 0.12);
    const a = hsvToRgb(hue, random.range(0.5, 0.78), random.range(0.12, 0.24));
    const b = hsvToRgb(secondary, random.range(0.58, 0.86), random.range(0.35, 0.55));
    const c = hsvToRgb(hue - 0.04, random.range(0.42, 0.72), random.range(0.65, 0.9));
    return { a, b, c };
  }

  static star(seed) {
    const random = new SeededRandom(hashSeed(seed, "star-palette"));
    const hue = random.range(0.02, 0.14);
    const base = hsvToRgb(hue, 0.3, 1.0);
    return { dark: scaleColor(base, 0.32), base, light: new Float32Array([1, 0.98, 0.86]) };
  }
}
