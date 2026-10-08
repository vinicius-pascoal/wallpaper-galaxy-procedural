import { CelestialBody } from "./CelestialBody.js";

export class Planet extends CelestialBody {
  constructor(seed, type = "terran") {
    super(seed);
    this.kind = "planet";
    this.type = type;
    this.position = new Float32Array(2);
    this.orbit = null;
    this.radius = 0.03;
    this.rotation = 0;
    this.initialRotation = 0;
    this.rotationSpeed = 0.01;
    this.rotationDirection = 1;
    this.lightDirection = new Float32Array([0, 0, 1]);
    this.palette = null;
    this.seed01 = (this.seed >>> 0) / 4294967296;
    this.depth = 0.06;
    this.lod = 0;
  }
}
