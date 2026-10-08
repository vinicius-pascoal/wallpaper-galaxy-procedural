import { hashSeed } from "../procedural/Hash.js";
import { Galaxy } from "../galaxy/Galaxy.js";
import { Nebula } from "../galaxy/Nebula.js";
import { StarField } from "../galaxy/StarField.js";
import { SystemGenerator } from "../procedural/SystemGenerator.js";
import { LODManager } from "./LODManager.js";

export class Universe {
  constructor(seed, quality) {
    this.seed = seed >>> 0;
    this.quality = quality;
    this.galaxy = new Galaxy(hashSeed(this.seed, "galaxy"), quality.galaxyCount);
    this.starField = new StarField(hashSeed(this.seed, "background-stars"), quality.starCount);
    this.nebula = new Nebula(hashSeed(this.seed, "nebulae"), quality.nebulaCount);
    this.lod = new LODManager(quality.maxFullDetailPlanets);
    this.systems = SystemGenerator.createSystems(hashSeed(this.seed, "solar-systems"), quality.systemCount, {
      forceHero: true,
      positions: [
        new Float32Array([0.12, -0.18]),
        new Float32Array([-0.58, 0.36]),
        new Float32Array([0.58, 0.38]),
        new Float32Array([-0.44, -0.46]),
      ],
    });
    this.heroSystem = this.systems[0];
    this.terran = this.heroSystem.planets.find((planet) => planet.type === "terran") ?? null;
    this.starLayer = null;
    this.galaxyLayer = null;
  }

  upload(renderer) {
    this.starLayer = renderer.createPointLayer(this.starField.data);
    this.galaxyLayer = renderer.createPointLayer(this.galaxy.data);
    for (let index = 0; index < this.systems.length; index += 1) {
      this.systems[index].orbitLayer = renderer.createLineLayer(this.systems[index].orbits.lineData);
    }
  }

  update(time) {
    for (let index = 0; index < this.systems.length; index += 1) {
      this.systems[index].update(time.elapsed);
    }
  }

  get stats() {
    return {
      starCount: this.starField.count,
      galaxyCount: this.galaxy.count,
      nebulaCount: this.nebula.count,
      systemCount: this.systems.length,
      planetCount: this.systems.reduce((total, system) => total + system.planets.length, 0),
      terranSeed: this.terran?.seed ?? 0,
      terranRadius: this.terran?.radius ?? 0,
      terranRotationSpeed: this.terran?.rotationSpeed ?? 0,
      terranCloudRotationSpeed: this.terran?.cloudRotationSpeed ?? 0,
      fbmOctaves: this.terran?.octaves ?? 0,
      lodCounts: this.lod.counts,
      culledBodies: this.lod.culled,
    };
  }
}
