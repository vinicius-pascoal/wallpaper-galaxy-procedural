import { ShaderLoader } from "./ShaderLoader.js";
import { ShaderProgram } from "./ShaderProgram.js";

const PARTICLE_STRIDE = 7;

export class Renderer {
  constructor(canvas, quality) {
    this.canvas = canvas;
    this.quality = quality;
    this.gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
    });
    if (!this.gl) {
      throw new Error("WebGL2 não está disponível neste ambiente.");
    }

    this.loader = new ShaderLoader(new URL("../../shaders/galaxy/", import.meta.url));
    this.internalWidth = 1;
    this.internalHeight = quality.internalHeight;
    this.aspect = 1;
    this.drawCalls = 0;
    this.planetDrawCalls = 0;
    this.starDrawCalls = 0;
    this._cameraOffset = new Float32Array(2);
    this._planetCenter = new Float32Array(2);
    this._lightDirection = new Float32Array(2);
  }

  async initialize() {
    const [fullscreenVertex, upscaleFragment, starsVertex, starsFragment, galaxyVertex, galaxyFragment, nebulaFragment, terranFragment, starFragment, gasFragment, lavaFragment, iceFragment, simplePointVertex, simplePointFragment, orbitVertex, orbitFragment] = await Promise.all([
      this.loader.load("../common/fullscreen.vert"),
      this.loader.load("../common/upscale.frag"),
      this.loader.load("stars.vert"),
      this.loader.load("stars.frag"),
      this.loader.load("galaxy.vert"),
      this.loader.load("galaxy.frag"),
      this.loader.load("nebula.frag"),
      this.loader.load("../planets/terran.frag"),
      this.loader.load("../star/star.frag"),
      this.loader.load("../planets/gas.frag"),
      this.loader.load("../planets/lava.frag"),
      this.loader.load("../planets/ice.frag"),
      this.loader.load("../common/simple-point.vert"),
      this.loader.load("../common/simple-point.frag"),
      this.loader.load("../common/orbit.vert"),
      this.loader.load("../common/orbit.frag"),
    ]);

    const gl = this.gl;
    this.upscaleProgram = new ShaderProgram(gl, fullscreenVertex, upscaleFragment, "upscale");
    this.starsProgram = new ShaderProgram(gl, starsVertex, starsFragment, "stars");
    this.galaxyProgram = new ShaderProgram(gl, galaxyVertex, galaxyFragment, "galaxy");
    this.nebulaProgram = new ShaderProgram(gl, fullscreenVertex, nebulaFragment, "nebula");
    this.terranProgram = new ShaderProgram(gl, fullscreenVertex, terranFragment, "terran");
    this.starProgram = new ShaderProgram(gl, fullscreenVertex, starFragment, "star");
    this.gasProgram = new ShaderProgram(gl, fullscreenVertex, gasFragment, "gas");
    this.lavaProgram = new ShaderProgram(gl, fullscreenVertex, lavaFragment, "lava");
    this.iceProgram = new ShaderProgram(gl, fullscreenVertex, iceFragment, "ice");
    this.simplePointProgram = new ShaderProgram(gl, simplePointVertex, simplePointFragment, "simple-point");
    this.orbitProgram = new ShaderProgram(gl, orbitVertex, orbitFragment, "orbit");

    this.quadVao = gl.createVertexArray();
    this.quadBuffer = gl.createBuffer();
    gl.bindVertexArray(this.quadVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    this.simplePointVao = gl.createVertexArray();
    this.simplePointBuffer = gl.createBuffer();
    gl.bindVertexArray(this.simplePointVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.simplePointBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE);
    this.resize();
  }

  createPointLayer(data) {
    const gl = this.gl;
    const vao = gl.createVertexArray();
    const buffer = gl.createBuffer();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    const stride = PARTICLE_STRIDE * Float32Array.BYTES_PER_ELEMENT;
    const attributes = [
      [0, 2, 0],
      [1, 1, 2],
      [2, 1, 3],
      [3, 1, 4],
      [4, 1, 5],
      [5, 1, 6],
      [6, 1, 7],
    ];
    for (const [location, size, componentOffset] of attributes) {
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, size, gl.FLOAT, false, stride, componentOffset * Float32Array.BYTES_PER_ELEMENT);
    }
    gl.bindVertexArray(null);
    return { vao, buffer, count: data.length / PARTICLE_STRIDE };
  }

  createLineLayer(data) {
    const gl = this.gl;
    const vao = gl.createVertexArray();
    const buffer = gl.createBuffer();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
    return { vao, buffer, count: data.length / 2 };
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const displayWidth = Math.max(1, Math.floor(this.canvas.clientWidth * dpr));
    const displayHeight = Math.max(1, Math.floor(this.canvas.clientHeight * dpr));
    if (this.canvas.width !== displayWidth || this.canvas.height !== displayHeight) {
      this.canvas.width = displayWidth;
      this.canvas.height = displayHeight;
    }

    this.aspect = displayWidth / displayHeight;
    this.internalHeight = this.quality.internalHeight;
    this.internalWidth = Math.max(1, Math.round(this.internalHeight * this.aspect));
    this._ensureTarget();
  }

  _ensureTarget() {
    const gl = this.gl;
    if (this.target && this.target.width === this.internalWidth && this.target.height === this.internalHeight) {
      return;
    }
    if (this.target) {
      gl.deleteFramebuffer(this.target.framebuffer);
      gl.deleteTexture(this.target.texture);
    }

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, this.internalWidth, this.internalHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    const framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
      throw new Error("Não foi possível criar o framebuffer de resolução interna.");
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    this.target = { framebuffer, texture, width: this.internalWidth, height: this.internalHeight };
  }

  beginFrame() {
    const gl = this.gl;
    this.drawCalls = 0;
    this.planetDrawCalls = 0;
    this.starDrawCalls = 0;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.target.framebuffer);
    gl.viewport(0, 0, this.internalWidth, this.internalHeight);
    gl.disable(gl.SCISSOR_TEST);
    gl.clearColor(0.003, 0.005, 0.018, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
  }

  renderPoints(layer, program, time, camera, rotationSpeed) {
    const gl = this.gl;
    const offset = camera.getOffset(this._cameraOffset);
    program.use();
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.uniform1f(program.uniform("uTime"), time.elapsed);
    gl.uniform2f(program.uniform("uCameraOffset"), offset[0], offset[1]);
    gl.uniform1f(program.uniform("uAspect"), this.aspect);
    gl.uniform1f(program.uniform("uZoom"), camera.zoom);
    gl.uniform1f(program.uniform("uGalaxyRotation"), time.elapsed * rotationSpeed);
    gl.uniform1f(program.uniform("uInternalHeight"), this.internalHeight);
    gl.bindVertexArray(layer.vao);
    gl.drawArrays(gl.POINTS, 0, layer.count);
    this.drawCalls += 1;
  }

  renderNebulae(nebula, time, camera) {
    const gl = this.gl;
    const offset = camera.getOffset(this._cameraOffset);
    this.nebulaProgram.use();
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.uniform1f(this.nebulaProgram.uniform("uTime"), time.elapsed);
    gl.uniform1f(this.nebulaProgram.uniform("uAspect"), this.aspect);
    gl.uniform2f(this.nebulaProgram.uniform("uCameraOffset"), offset[0], offset[1]);
    gl.uniform1i(this.nebulaProgram.uniform("uNebulaCount"), nebula.count);
    gl.uniform2fv(this.nebulaProgram.uniform("uCenters"), nebula.centers);
    gl.uniform2fv(this.nebulaProgram.uniform("uScales"), nebula.scales);
    gl.uniform1fv(this.nebulaProgram.uniform("uRotations"), nebula.rotations);
    gl.uniform1fv(this.nebulaProgram.uniform("uThresholds"), nebula.thresholds);
    gl.uniform1fv(this.nebulaProgram.uniform("uSoftness"), nebula.softness);
    gl.uniform1fv(this.nebulaProgram.uniform("uWarpStrength"), nebula.warpStrength);
    gl.uniform1fv(this.nebulaProgram.uniform("uBrightness"), nebula.brightness);
    gl.uniform1fv(this.nebulaProgram.uniform("uOpacity"), nebula.opacity);
    gl.uniform1fv(this.nebulaProgram.uniform("uSpeeds"), nebula.speeds);
    gl.uniform2fv(this.nebulaProgram.uniform("uSeedOffsets"), nebula.seedOffsets);
    gl.uniform3fv(this.nebulaProgram.uniform("uColorA"), nebula.colorA);
    gl.uniform3fv(this.nebulaProgram.uniform("uColorB"), nebula.colorB);
    gl.uniform3fv(this.nebulaProgram.uniform("uColorC"), nebula.colorC);
    gl.bindVertexArray(this.quadVao);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    this.drawCalls += 1;
  }

  renderOrbitLines(system, camera) {
    if (!system.orbitLayer || system.orbitLayer.count === 0) return;
    const gl = this.gl;
    const offset = camera.getOffset(this._cameraOffset);
    this.orbitProgram.use();
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.uniform1f(this.orbitProgram.uniform("uAspect"), this.aspect);
    gl.uniform1f(this.orbitProgram.uniform("uDepth"), system.depth);
    gl.uniform2f(this.orbitProgram.uniform("uCameraOffset"), offset[0], offset[1]);
    gl.bindVertexArray(system.orbitLayer.vao);
    gl.drawArrays(gl.LINES, 0, system.orbitLayer.count);
    this.drawCalls += 1;
  }

  renderPlanet(planet, time, camera) {
    this.renderBody(planet, null, 3, time, camera);
  }

  renderBody(body, star, lod, time, camera) {
    if (!body || !body.visible) return;
    if (lod === 0) {
      this._renderSimpleBody(body, time, camera);
      return;
    }
    this._beginBodyScissor(body, camera);
    if (body.kind === "star") {
      this._renderStar(body, lod, time, camera);
    } else {
      this._renderPlanetBody(body, star, lod, time, camera);
    }
    this.gl.disable(this.gl.SCISSOR_TEST);
  }

  _beginBodyScissor(body, camera) {
    const gl = this.gl;
    const offset = camera.getOffset(this._cameraOffset);
    const clipX = body.position[0] + (offset[0] * body.depth) / this.aspect;
    const clipY = body.position[1] + offset[1] * body.depth;
    const padding = body.kind === "star" ? 0.055 : 0.025;
    const radius = (body.radius + padding) * this.internalHeight * 0.5;
    const centerX = (clipX * 0.5 + 0.5) * this.internalWidth;
    const centerY = (clipY * 0.5 + 0.5) * this.internalHeight;
    const left = Math.max(0, Math.floor(centerX - radius));
    const bottom = Math.max(0, Math.floor(centerY - radius));
    const right = Math.min(this.internalWidth, Math.ceil(centerX + radius));
    const top = Math.min(this.internalHeight, Math.ceil(centerY + radius));
    gl.enable(gl.SCISSOR_TEST);
    gl.scissor(left, bottom, Math.max(1, right - left), Math.max(1, top - bottom));
  }

  _setBodyCommon(program, body, lod, time, camera) {
    const gl = this.gl;
    const offset = camera.getOffset(this._cameraOffset);
    this._planetCenter[0] = body.position[0] * this.aspect;
    this._planetCenter[1] = body.position[1];
    program.use();
    gl.uniform1f(program.uniform("uTime"), time.elapsed);
    gl.uniform1f(program.uniform("uAspect"), this.aspect);
    gl.uniform1f(program.uniform("uInternalHeight"), this.internalHeight);
    gl.uniform1f(program.uniform("uPixelScale"), lod === 1 ? 2.0 : 1.0);
    gl.uniform1f(program.uniform("uRadius"), body.radius);
    gl.uniform1f(program.uniform("uSeed"), body.seed01);
    gl.uniform1f(program.uniform("uRotationSpeed"), body.rotationSpeed);
    gl.uniform1f(program.uniform("uDepth"), body.depth);
    gl.uniform1i(program.uniform("uLod"), lod);
    gl.uniform2fv(program.uniform("uCenter"), this._planetCenter);
    gl.uniform2f(program.uniform("uCameraOffset"), offset[0], offset[1]);
  }

  _renderSimpleBody(body, time, camera) {
    const gl = this.gl;
    const offset = camera.getOffset(this._cameraOffset);
    const centerX = body.position[0] * this.aspect;
    this.simplePointProgram.use();
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.uniform2f(this.simplePointProgram.uniform("uCenter"), centerX, body.position[1]);
    gl.uniform1f(this.simplePointProgram.uniform("uAspect"), this.aspect);
    gl.uniform1f(this.simplePointProgram.uniform("uRadius"), body.radius);
    gl.uniform1f(this.simplePointProgram.uniform("uInternalHeight"), this.internalHeight);
    gl.uniform1f(this.simplePointProgram.uniform("uDepth"), body.depth);
    gl.uniform2f(this.simplePointProgram.uniform("uCameraOffset"), offset[0], offset[1]);
    gl.uniform3fv(this.simplePointProgram.uniform("uColor"), this._bodyColor(body));
    gl.bindVertexArray(this.simplePointVao);
    gl.drawArrays(gl.POINTS, 0, 1);
    this.drawCalls += 1;
    if (body.kind === "star") this.starDrawCalls += 1;
    if (body.kind === "planet") this.planetDrawCalls += 1;
  }

  _bodyColor(body) {
    if (body.kind === "star") return body.palette.base;
    if (body.type === "terran") return body.palette.landBase;
    if (body.type === "gas") return body.palette.base;
    if (body.type === "lava") return body.palette.crust;
    return body.palette.base;
  }

  _renderStar(star, lod, time, camera) {
    const gl = this.gl;
    this._setBodyCommon(this.starProgram, star, lod, time, camera);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.uniform1f(this.starProgram.uniform("uFlareStrength"), star.flareStrength);
    gl.uniform1f(this.starProgram.uniform("uActivity"), star.activity);
    gl.uniform3fv(this.starProgram.uniform("uColorDark"), star.palette.dark);
    gl.uniform3fv(this.starProgram.uniform("uColorBase"), star.palette.base);
    gl.uniform3fv(this.starProgram.uniform("uColorLight"), star.palette.light);
    gl.uniform3fv(this.starProgram.uniform("uColorFlare"), star.palette.flare);
    gl.bindVertexArray(this.quadVao);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    this.drawCalls += 1;
    this.starDrawCalls += 1;
  }

  _renderPlanetBody(planet, star, lod, time, camera) {
    const gl = this.gl;
    const program = planet.type === "terran" ? this.terranProgram
      : planet.type === "gas" ? this.gasProgram
        : planet.type === "lava" ? this.lavaProgram : this.iceProgram;
    this._setBodyCommon(program, planet, lod, time, camera);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    this._lightDirection[0] = (star ? star.position[0] - planet.position[0] : -0.45) * this.aspect;
    this._lightDirection[1] = star ? star.position[1] - planet.position[1] : 0.5;
    const length = Math.hypot(this._lightDirection[0], this._lightDirection[1]) || 1;
    this._lightDirection[0] /= length;
    this._lightDirection[1] /= length;
    gl.uniform2fv(program.uniform("uLightDirection"), this._lightDirection);

    if (planet.type === "terran") {
      gl.uniform1f(program.uniform("uPixelScale"), lod === 1 ? 2.4 : planet.pixelScale);
      gl.uniform1f(program.uniform("uTerrainScale"), planet.terrainScale);
      gl.uniform1f(program.uniform("uCloudScale"), planet.cloudScale);
      gl.uniform1f(program.uniform("uSeaLevel"), planet.seaLevel);
      gl.uniform1f(program.uniform("uCloudSpeed"), planet.cloudSpeed);
      gl.uniform1f(program.uniform("uCloudCoverage"), planet.cloudCoverage);
      gl.uniform1f(program.uniform("uAtmosphereStrength"), planet.atmosphereStrength);
      gl.uniform1f(program.uniform("uOctaves"), lod <= 1 ? 2 : lod === 2 ? 3 : planet.octaves);
      gl.uniform3fv(program.uniform("uOceanDark"), planet.palette.oceanDark);
      gl.uniform3fv(program.uniform("uOceanLight"), planet.palette.oceanLight);
      gl.uniform3fv(program.uniform("uLandDark"), planet.palette.landDark);
      gl.uniform3fv(program.uniform("uLandBase"), planet.palette.landBase);
      gl.uniform3fv(program.uniform("uLandLight"), planet.palette.landLight);
      gl.uniform3fv(program.uniform("uCloudShadow"), planet.palette.cloudShadow);
      gl.uniform3fv(program.uniform("uCloudLight"), planet.palette.cloudLight);
      gl.uniform3fv(program.uniform("uAtmosphere"), planet.palette.atmosphere);
    } else if (planet.type === "gas") {
      gl.uniform1f(program.uniform("uBandFrequency"), planet.bandFrequency);
      gl.uniform1f(program.uniform("uBandWarp"), planet.bandWarp);
      gl.uniform1f(program.uniform("uRingTilt"), planet.ringTilt);
      gl.uniform1f(program.uniform("uRingWidth"), planet.ringWidth);
      gl.uniform1i(program.uniform("uHasRings"), lod >= 2 && planet.hasRings ? 1 : 0);
      gl.uniform3fv(program.uniform("uColorDark"), planet.palette.dark);
      gl.uniform3fv(program.uniform("uColorBase"), planet.palette.base);
      gl.uniform3fv(program.uniform("uColorLight"), planet.palette.light);
      gl.uniform3fv(program.uniform("uRingColor"), planet.palette.ring);
    } else if (planet.type === "lava") {
      gl.uniform1f(program.uniform("uCrackScale"), planet.crackScale);
      gl.uniform1f(program.uniform("uLavaThreshold"), planet.lavaThreshold);
      gl.uniform3fv(program.uniform("uCrustDark"), planet.palette.crustDark);
      gl.uniform3fv(program.uniform("uCrust"), planet.palette.crust);
      gl.uniform3fv(program.uniform("uHot"), planet.palette.hot);
      gl.uniform3fv(program.uniform("uGlow"), planet.palette.glow);
    } else {
      gl.uniform1f(program.uniform("uCrackScale"), planet.crackScale);
      gl.uniform1f(program.uniform("uIceCoverage"), planet.iceCoverage);
      gl.uniform3fv(program.uniform("uColorDark"), planet.palette.dark);
      gl.uniform3fv(program.uniform("uColorBase"), planet.palette.base);
      gl.uniform3fv(program.uniform("uColorLight"), planet.palette.light);
      gl.uniform3fv(program.uniform("uCrackColor"), planet.palette.crack);
    }
    gl.bindVertexArray(this.quadVao);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    this.drawCalls += 1;
    this.planetDrawCalls += 1;
  }

  endFrame() {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.disable(gl.BLEND);
    gl.clearColor(0.003, 0.005, 0.018, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    this.upscaleProgram.use();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.target.texture);
    gl.uniform1i(this.upscaleProgram.uniform("uTexture"), 0);
    gl.bindVertexArray(this.quadVao);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    this.drawCalls += 1;
  }
}
