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

  static dryTerran(seed) {
    const random = new SeededRandom(hashSeed(seed, "dry-terran-palette"));
    const hue = random.range(0.02, 0.12);
    return {
      oceanDark: hsvToRgb(0.58, 0.55, 0.08),
      oceanLight: hsvToRgb(0.09, 0.54, 0.22),
      landDark: hsvToRgb(hue, 0.64, random.range(0.16, 0.25)),
      landBase: hsvToRgb(hue + 0.02, 0.56, random.range(0.3, 0.44)),
      landLight: hsvToRgb(hue - 0.015, 0.46, random.range(0.58, 0.78)),
      cloudShadow: hsvToRgb(0.08, 0.18, 0.42),
      cloudLight: hsvToRgb(0.08, 0.08, 0.88),
      atmosphere: hsvToRgb(0.07, 0.5, 0.54),
    };
  }

  static islands(seed) {
    const random = new SeededRandom(hashSeed(seed, "islands-palette"));
    const oceanHue = random.range(0.52, 0.61);
    const landHue = random.range(0.22, 0.36);
    return {
      ...this.terran(seed),
      oceanDark: hsvToRgb(oceanHue, 0.82, random.range(0.12, 0.22)),
      oceanLight: hsvToRgb(oceanHue + 0.02, 0.68, random.range(0.42, 0.62)),
      landDark: hsvToRgb(landHue, 0.7, random.range(0.16, 0.25)),
      landBase: hsvToRgb(landHue + 0.02, 0.6, random.range(0.36, 0.5)),
      landLight: hsvToRgb(landHue - 0.02, 0.5, random.range(0.56, 0.7)),
    };
  }

  static rocky(seed) {
    const random = new SeededRandom(hashSeed(seed, "rocky-palette"));
    const hue = random.range(0.92, 0.05);
    return {
      crustDark: hsvToRgb(hue, random.range(0.34, 0.58), random.range(0.08, 0.16)),
      crust: hsvToRgb(hue + 0.02, random.range(0.26, 0.48), random.range(0.2, 0.34)),
      hot: hsvToRgb(hue + 0.03, random.range(0.18, 0.36), random.range(0.42, 0.58)),
      glow: hsvToRgb(hue + 0.02, random.range(0.12, 0.3), random.range(0.62, 0.82)),
      base: hsvToRgb(hue + 0.02, random.range(0.26, 0.48), random.range(0.24, 0.4)),
    };
  }

  static asteroid(seed) {
    const random = new SeededRandom(hashSeed(seed, "asteroid-palette"));
    const hue = random.range(0.54, 0.66);
    return {
      light: hsvToRgb(hue, random.range(0.12, 0.3), random.range(0.56, 0.74)),
      base: hsvToRgb(hue + 0.02, random.range(0.24, 0.46), random.range(0.28, 0.44)),
      dark: hsvToRgb(hue + 0.04, random.range(0.28, 0.52), random.range(0.12, 0.24)),
    };
  }

  static blackHole(seed) {
    const random = new SeededRandom(hashSeed(seed, "black-hole-palette"));
    const families = [0.045, 0.56, 0.82, 0.62, 0.98];
    const hue = families[random.int(0, families.length)] + random.range(-0.025, 0.025);
    const disk = hsvToRgb(hue, random.range(0.48, 0.82), random.range(0.68, 0.94));
    const hot = hsvToRgb(hue + 0.035, random.range(0.35, 0.72), 1.0);
    const cool = hsvToRgb(hue - 0.045, random.range(0.34, 0.7), random.range(0.45, 0.75));
    return {
      core: new Float32Array([0.008, 0.006, 0.018]),
      disk: scaleColor(disk, 0.78),
      hot,
      cool,
      glow: scaleColor(hot, 0.72),
    };
  }

  static comet(seed) {
    const random = new SeededRandom(hashSeed(seed, "comet-palette"));
    const hue = random.range(0.52, 0.64);
    return {
      nucleus: hsvToRgb(hue + 0.04, random.range(0.12, 0.34), random.range(0.42, 0.7)),
      coma: hsvToRgb(hue, random.range(0.22, 0.48), random.range(0.55, 0.86)),
      dust: hsvToRgb(random.range(0.06, 0.14), random.range(0.32, 0.68), random.range(0.42, 0.7)),
      ion: hsvToRgb(hue + 0.02, random.range(0.38, 0.76), random.range(0.62, 0.94)),
    };
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

  static star(seed, type = "yellow") {
    const random = new SeededRandom(hashSeed(seed, "star-palette"));
    const profiles = {
      red: [0.01, 0.78, 0.96],
      orange: [0.06, 0.66, 1.0],
      yellow: [0.13, 0.34, 1.0],
      white: [0.58, 0.12, 1.0],
      blue: [0.63, 0.5, 1.0],
    };
    const profile = profiles[type] ?? profiles.yellow;
    const hue = profile[0] + random.range(-0.018, 0.018);
    const base = hsvToRgb(hue, profile[1], profile[2]);
    const light = hsvToRgb(hue + (type === "blue" ? -0.04 : 0.02), Math.max(0.04, profile[1] * 0.65), 1.0);
    return {
      dark: scaleColor(base, 0.28),
      base,
      light,
      flare: new Float32Array([Math.min(1, light[0] * 1.1), Math.min(1, light[1] * 1.1), Math.min(1, light[2] * 1.05)]),
    };
  }

  static gas(seed) {
    const random = new SeededRandom(hashSeed(seed, "gas-palette"));
    const hue = random.range(0.02, 0.96);
    return {
      dark: hsvToRgb(hue, random.range(0.42, 0.7), random.range(0.18, 0.28)),
      base: hsvToRgb(hue + 0.025, random.range(0.34, 0.62), random.range(0.38, 0.56)),
      light: hsvToRgb(hue - 0.02, random.range(0.24, 0.5), random.range(0.68, 0.86)),
      ring: hsvToRgb(hue + 0.08, random.range(0.25, 0.55), random.range(0.5, 0.78)),
    };
  }

  static lava(seed) {
    const random = new SeededRandom(hashSeed(seed, "lava-palette"));
    return {
      crustDark: hsvToRgb(random.range(0.0, 0.08), 0.58, random.range(0.08, 0.16)),
      crust: hsvToRgb(random.range(0.02, 0.1), 0.62, random.range(0.2, 0.32)),
      hot: hsvToRgb(random.range(0.04, 0.1), 0.78, random.range(0.72, 0.92)),
      glow: hsvToRgb(random.range(0.04, 0.12), 0.82, 1.0),
    };
  }

  static ice(seed) {
    const random = new SeededRandom(hashSeed(seed, "ice-palette"));
    const hue = random.range(0.52, 0.63);
    return {
      dark: hsvToRgb(hue, random.range(0.44, 0.7), random.range(0.12, 0.24)),
      base: hsvToRgb(hue + 0.02, random.range(0.3, 0.58), random.range(0.34, 0.52)),
      light: hsvToRgb(hue - 0.02, random.range(0.12, 0.36), random.range(0.74, 0.94)),
      crack: hsvToRgb(hue + 0.04, random.range(0.3, 0.6), random.range(0.5, 0.75)),
    };
  }
}
