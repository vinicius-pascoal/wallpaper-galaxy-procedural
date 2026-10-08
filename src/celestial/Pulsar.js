import { hashSeed } from "../procedural/Hash.js";
import { PaletteGenerator } from "../procedural/PaletteGenerator.js";
import { Star } from "./Star.js";

export class Pulsar extends Star {
  constructor(seed, options = {}) {
    super(seed, options);
    this.kind = "pulsar";
    this.pulseSpeed = 1.3 + ((hashSeed(this.seed, "pulse-speed") >>> 0) / 4294967296) * 0.7;
    this.pulseAmplitude = 0.08;
    this.beamAngle = options.beamAngle ?? 0;
    this.beamRotationSpeed = options.beamRotationSpeed ?? 0.012;
    this.beamLength = options.beamLength ?? 1.1;
    this.palette = PaletteGenerator.star(this.seed, "blue");
    this.depth = options.depth ?? this.depth;
  }
}
