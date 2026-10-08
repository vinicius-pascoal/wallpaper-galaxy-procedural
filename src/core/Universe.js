import { hashSeed } from "../procedural/Hash.js";
import { Galaxy } from "../galaxy/Galaxy.js";
import { Nebula } from "../galaxy/Nebula.js";
import { StarField } from "../galaxy/StarField.js";
import { SystemGenerator } from "../procedural/SystemGenerator.js";
import { LODManager } from "./LODManager.js";
import { BlackHole } from "../celestial/BlackHole.js";
import { CosmicEventSystem } from "../systems/CosmicEventSystem.js";
import { SeededRandom } from "../procedural/SeededRandom.js";

export class Universe {
  constructor(seed, quality, options = {}) {
    this.seed = seed >>> 0;
    this.quality = quality;
    this.options = options;
    this.galaxy = new Galaxy(hashSeed(this.seed, "galaxy"), quality.galaxyCount);
    this.starField = new StarField(hashSeed(this.seed, "background-stars"), quality.starCount);
    this.nebula = new Nebula(hashSeed(this.seed, "nebulae"), quality.nebulaCount);
    const blackHoleRoll = (hashSeed(this.seed, "black-hole-mode") >>> 0) / 4294967296;
    this.blackHole = options.specialObjects === false || options.blackHole === "off" ? null : options.blackHole === "on" || blackHoleRoll < 0.25
      ? new BlackHole(hashSeed(this.seed, "central-black-hole"), { mode: "galactic-center", position: [0, 0], radius: 0.07, depth: 0.02 })
      : blackHoleRoll < 0.30
        ? new BlackHole(hashSeed(this.seed, "foreground-black-hole"), {
          mode: "special",
          position: [new SeededRandom(hashSeed(this.seed, "black-hole-x")).range(-0.68, 0.68), new SeededRandom(hashSeed(this.seed, "black-hole-y")).range(-0.5, 0.5)],
          radius: 0.055,
          depth: 0.028,
        })
        : null;
    this.lod = new LODManager(quality.maxFullDetailPlanets, quality.maxFullDetailBodies);
    this.systems = SystemGenerator.createSystems(hashSeed(this.seed, "solar-systems"), quality.systemCount, {
      forceHero: true,
      moons: options.moons,
      comets: options.comets,
      asteroidBelts: options.asteroidBelts,
      specialObjects: options.specialObjects,
      positions: [
        new Float32Array([0.12, -0.18]),
        new Float32Array([-0.58, 0.36]),
        new Float32Array([0.58, 0.38]),
        new Float32Array([-0.44, -0.46]),
      ],
    });
    this.heroSystem = this.systems[0] ?? null;
    this.terran = this.heroSystem?.planets.find((planet) => planet.type === "terran") ?? null;
    this.starLayer = null;
    this.galaxyLayer = null;
    this.cosmicEvents = new CosmicEventSystem(this.seed, quality, options);
  }

  upload(renderer) {
    this.starLayer = renderer.createPointLayer(this.starField.data);
    this.galaxyLayer = renderer.createPointLayer(this.galaxy.data);
    for (let index = 0; index < this.systems.length; index += 1) {
      this.systems[index].orbitLayer = renderer.createLineLayer(this.systems[index].orbits.lineData);
      const belt = this.systems[index].asteroidBelt;
      if (belt) {
        belt.backLayer = renderer.createAsteroidLayer(belt.backData);
        belt.frontLayer = renderer.createAsteroidLayer(belt.frontData);
      }
    }
  }

  update(time) {
    for (let index = 0; index < this.systems.length; index += 1) {
      this.systems[index].update(time.elapsed);
    }
    this.cosmicEvents.update(time, this);
  }

  regenerate(newSeed, quality = this.quality, renderer = null, options = this.options) {
    if (renderer) this.dispose(renderer);
    const replacement = new Universe(newSeed, quality, options);
    Object.assign(this, replacement);
    if (renderer) this.upload(renderer);
  }

  applyOptions(options = {}) {
    this.options = { ...this.options, ...options };
    this.cosmicEvents.setConfig(this.options);
  }

  dispose(renderer) {
    if (!renderer) return;
    for (const system of this.systems) {
      renderer.deleteLayer(system.orbitLayer);
      renderer.deleteLayer(system.asteroidBelt?.backLayer);
      renderer.deleteLayer(system.asteroidBelt?.frontLayer);
    }
    renderer.deleteLayer(this.starLayer);
    renderer.deleteLayer(this.galaxyLayer);
    this.starLayer = null;
    this.galaxyLayer = null;
  }

  get stats() {
    return {
      starCount: this.starField.count,
      galaxyCount: this.galaxy.count,
      nebulaCount: this.nebula.count,
      systemCount: this.systems.length,
      planetCount: this.systems.reduce((total, system) => total + system.planets.length, 0),
      moonCount: this.systems.reduce((total, system) => total + system.moons.length, 0),
      asteroidBeltCount: this.systems.reduce((total, system) => total + (system.asteroidBelt ? 1 : 0), 0),
      asteroidCount: this.systems.reduce((total, system) => total + (system.asteroidBelt?.count ?? 0), 0),
      cometCount: this.systems.reduce((total, system) => total + system.comets.length, 0),
      binarySystemCount: this.systems.reduce((total, system) => total + (system.binary ? 1 : 0), 0),
      pulsarCount: this.systems.reduce((total, system) => total + system.stars.filter((star) => star.kind === "pulsar").length, 0),
      blackHoleCount: this.blackHole ? 1 : 0,
      cosmicActivity: this.cosmicEvents.cosmicActivity,
      activeShootingStars: this.cosmicEvents.shootingStars.activeCount,
      nextEventType: this.cosmicEvents.nextEventType,
      activeRareEvent: this.cosmicEvents.activeEvent,
      terranSeed: this.terran?.seed ?? 0,
      terranRadius: this.terran?.radius ?? 0,
      terranRotationSpeed: this.terran?.rotationSpeed ?? 0,
      terranCloudRotationSpeed: this.terran?.cloudRotationSpeed ?? 0,
      fbmOctaves: this.terran?.octaves ?? 0,
      lodCounts: this.lod.counts,
      blackHoleLod: this.lod.specialCounts["black-hole"],
      cometLod: this.lod.specialCounts.comet,
      pulsarLod: this.lod.specialCounts.pulsar,
      culledBodies: this.lod.culled,
    };
  }
}
