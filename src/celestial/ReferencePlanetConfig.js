export const REFERENCE_PLANET_CONFIG = Object.freeze({
  terran: Object.freeze({
    water: Object.freeze({ pixels: 100, timeSpeed: 0.1, updateFactor: 0.02, lightBorder1: 0.4, lightBorder2: 0.6, size: 5.228, octaves: 3, seed: 10 }),
    land: Object.freeze({ pixels: 100, timeSpeed: 0.2, updateFactor: 0.02, lightBorder1: 0.32, lightBorder2: 0.534, landCutoff: 0.633, size: 4.292, octaves: 6, seed: 7.947, rotation: 0.2 }),
    clouds: Object.freeze({ pixels: 100, timeSpeed: 0.47, updateFactor: 0.01, cloudCover: 0.415, stretch: 2.0, cloudCurve: 1.3, lightBorder1: 0.52, lightBorder2: 0.62, size: 7.745, octaves: 2, seed: 5.939 }),
  }),
  gas: Object.freeze({
    layers: Object.freeze({ pixels: 100, timeSpeed: 0.05, updateFactor: 0.004, cloudCover: 0.61, stretch: 2.204, cloudCurve: 1.376, lightBorder1: 0.52, lightBorder2: 0.62, bands: 0.892, size: 10.107, octaves: 3, seed: 6.314 }),
    ring: Object.freeze({ pixels: 300, timeSpeed: 0.2, updateFactor: 0.00837758, ringWidth: 0.127, ringPerspective: 6.0, scaleRelative: 6.0, lightBorder1: 0.52, lightBorder2: 0.62, size: 15, octaves: 4, seed: 8.461, rotationOffset: 0.7, rotation: 0.7 }),
  }),
  lava: Object.freeze({
    land: Object.freeze({ pixels: 100, timeSpeed: 0.2, updateFactor: 0.02, lightBorder1: 0.4, lightBorder2: 0.6, size: 10, octaves: 3, seed: 1.551 }),
    craters: Object.freeze({ pixels: 100, timeSpeed: 0.2, updateFactor: 0.02, lightBorder: 0.4, size: 3.5, seed: 1.561 }),
    rivers: Object.freeze({ pixels: 100, timeSpeed: 0.2, updateFactor: 0.02, lightBorder1: 0.019, lightBorder2: 0.036, riverCutoff: 0.579, size: 10, octaves: 4, seed: 2.527 }),
  }),
  ice: Object.freeze({
    land: Object.freeze({ pixels: 100, timeSpeed: 0.25, updateFactor: 0.02, lightBorder1: 0.48, lightBorder2: 0.632, size: 8, octaves: 2, seed: 1.036 }),
    lakes: Object.freeze({ pixels: 100, timeSpeed: 0.2, updateFactor: 0.02, lightBorder1: 0.024, lightBorder2: 0.047, lakeCutoff: 0.55, size: 10, octaves: 3, seed: 1.14 }),
    clouds: Object.freeze({ pixels: 100, timeSpeed: 0.1, updateFactor: 0.01, cloudCover: 0.546, stretch: 2.5, cloudCurve: 1.3, lightBorder1: 0.566, lightBorder2: 0.781, size: 4, octaves: 4, seed: 1.14 }),
  }),
  star: Object.freeze({
    blobs: Object.freeze({ pixels: 200, timeSpeed: 0.05, updateFactor: 0.01, circleAmount: 2, circleSize: 1, size: 4.93, octaves: 4, seed: 3.078, relativeScale: 2 }),
    surface: Object.freeze({ pixels: 100, timeSpeed: 0.05, updateFactor: 0.005, size: 4.463, octaves: 4, seed: 4.837, tiles: 1 }),
    flares: Object.freeze({ pixels: 200, timeSpeed: 0.05, updateFactor: 0.015, stormWidth: 0.3, stormDitherWidth: 0, scale: 1, circleAmount: 2, circleScale: 1, size: 1.6, octaves: 4, seed: 3.078, relativeScale: 2 }),
  }),
});

export const REFERENCE_PALETTES = Object.freeze({
  terran: Object.freeze({
    water: [[0.572549, 0.909804, 0.752941], [0.309804, 0.643137, 0.721569], [0.172549, 0.207843, 0.301961]],
    land: [[0.784314, 0.831373, 0.364706], [0.388235, 0.670588, 0.247059], [0.184314, 0.341176, 0.32549], [0.156863, 0.207843, 0.25098]],
    clouds: [[0.87451, 0.878431, 0.909804], [0.639216, 0.654902, 0.760784], [0.407843, 0.435294, 0.6], [0.25098, 0.286275, 0.45098]],
  }),
  gas: Object.freeze({
    layers: [[0.933333, 0.764706, 0.603922], [0.85098, 0.627451, 0.4], [0.560784, 0.337255, 0.231373]],
    layersDark: [[0.4, 0.223529, 0.192157], [0.270588, 0.156863, 0.235294], [0.133333, 0.12549, 0.203922]],
    ring: [[0.933333, 0.764706, 0.603922], [0.701961, 0.478431, 0.313726], [0.560784, 0.337255, 0.231373]],
    ringDark: [[0.333333, 0.188235, 0.211765], [0.196078, 0.137255, 0.215686], [0.133333, 0.12549, 0.203922]],
  }),
  lava: Object.freeze({
    land: [[0.560784, 0.301961, 0.341176], [0.321569, 0.2, 0.247059], [0.239216, 0.160784, 0.211765]],
    craters: [[0.321569, 0.2, 0.247059], [0.239216, 0.160784, 0.211765]],
    rivers: [[1, 0.537255, 0.2], [0.901961, 0.270588, 0.223529], [0.678431, 0.184314, 0.270588]],
  }),
  ice: Object.freeze({
    land: [[0.980392, 1, 1], [0.780392, 0.831373, 0.882353], [0.572549, 0.560784, 0.721569]],
    lakes: [[0.309804, 0.643137, 0.721569], [0.298039, 0.407843, 0.521569], [0.227451, 0.247059, 0.368627]],
    clouds: [[0.882353, 0.94902, 1], [0.752941, 0.890196, 1], [0.368627, 0.439216, 0.647059], [0.25098, 0.286275, 0.45098]],
  }),
  star: Object.freeze({
    blobs: [[1, 1, 0.894118]],
    surface: [[0.960784, 1, 0.909804], [0.466667, 0.839216, 0.756863], [0.109804, 0.572549, 0.654902], [0.0117647, 0.243137, 0.368627]],
    flares: [[0.466667, 0.839216, 0.756863], [1, 1, 0.894118]],
  }),
});
