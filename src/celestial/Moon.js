import { Planet } from "./Planet.js";

export const MoonType = Object.freeze({
  ROCKY: "rocky",
  ICY: "icy",
});

export class Moon extends Planet {
  constructor(seed, type = MoonType.ROCKY, parent = null) {
    super(seed, type === MoonType.ICY ? "ice" : "rocky");
    this.kind = "moon";
    this.moonType = type;
    this.parent = parent;
    this.depth = parent ? parent.depth + 0.002 : 0.08;
    this.rotationSpeed *= 0.45;
    this.radius = 0.015;
    this.orbitDepth = 0;
    this.renderDepth = this.depth;
  }
}
