import { hashSeed } from "../procedural/Hash.js";
import { BlackHole } from "../celestial/BlackHole.js";
import { Comet } from "../celestial/Comet.js";
import { Pulsar } from "../celestial/Pulsar.js";
import { Star } from "../celestial/Star.js";
import { BinaryStarPair } from "../celestial/BinaryStarPair.js";
import { ShootingStarSystem } from "../systems/ShootingStarSystem.js";

const POSITIONS = Object.freeze([
  [-0.72, 0.32], [-0.24, 0.32], [0.28, 0.32], [0.72, 0.32],
  [-0.48, -0.32], [0.2, -0.32],
]);

export class SpecialGallery {
  constructor(seed) {
    const gallerySeed = hashSeed(seed, "special-gallery");
    this.blackHole = new BlackHole(hashSeed(gallerySeed, "black-hole"), { position: POSITIONS[0], radius: 0.12, depth: 0 });
    this.pulsar = new Pulsar(hashSeed(gallerySeed, "pulsar"), { radius: 0.09, depth: 0 });
    this.pulsar.position[0] = POSITIONS[1][0];
    this.pulsar.position[1] = POSITIONS[1][1];
    const binaryA = new Star(hashSeed(gallerySeed, "binary-a"), { radius: 0.07, depth: 0 });
    const binaryB = new Star(hashSeed(gallerySeed, "binary-b"), { radius: 0.05, depth: 0 });
    this.binary = new BinaryStarPair(binaryA, binaryB, new Float32Array(POSITIONS[2]), hashSeed(gallerySeed, "binary"));
    this.cometStar = new Star(hashSeed(gallerySeed, "comet-star"), { radius: 0.035, depth: 0 });
    this.cometStar.position[0] = POSITIONS[3][0];
    this.cometStar.position[1] = POSITIONS[3][1];
    this.comet = new Comet(hashSeed(gallerySeed, "comet"), this.cometStar, { radius: 0.025, depth: 0 });
    this.comet.position[0] = POSITIONS[4][0];
    this.comet.position[1] = POSITIONS[4][1];
    this.comet.tailDirection[0] = 0.9;
    this.comet.tailDirection[1] = -0.2;
    this.light = { position: this.cometStar.position };
    this.shootingStars = new ShootingStarSystem(hashSeed(gallerySeed, "shooting-preview"), 1);
    this.shootingStars.spawn(hashSeed(gallerySeed, "shooting-preview-event"), 0, { x: 0.35, y: -0.02, angle: 2.7, duration: 100, speed: 0.02, length: 0.22 });
    this.bodies = [this.blackHole, this.pulsar, binaryA, binaryB, this.cometStar, this.comet];
  }

  update(elapsed) {
    this.binary.update(elapsed);
    this.comet.rotation = this.comet.initialRotation + elapsed * this.comet.rotationSpeed;
    this.comet.tailDirection[0] = Math.cos(elapsed * 0.1);
    this.comet.tailDirection[1] = Math.sin(elapsed * 0.1);
    this.shootingStars.update(elapsed);
    for (const body of this.bodies) {
      body.orbitDepth = 0;
      body.renderDepth = body.depth;
    }
  }
}
