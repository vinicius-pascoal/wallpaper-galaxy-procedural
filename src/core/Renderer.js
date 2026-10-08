import { ShaderLoader } from "./ShaderLoader.js";
import { ShaderProgram } from "./ShaderProgram.js";
import { REFERENCE_PALETTES, REFERENCE_PLANET_CONFIG } from "../celestial/ReferencePlanetConfig.js";

const PARTICLE_STRIDE = 7;

export class Renderer {
  constructor(canvas, quality, options = {}) {
    this.canvas = canvas;
    this.quality = quality;
    this.options = options;
    this.referencePalette = options.referencePalette === true;
    this.referenceParameters = options.referenceParameters === true;
    this.animationDebugSpeed = Number.isFinite(options.animationDebugSpeed) ? options.animationDebugSpeed : 1;
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
    this.moonDrawCalls = 0;
    this.asteroidDrawCalls = 0;
    this.asteroidBeltDrawCalls = 0;
    this.starDrawCalls = 0;
    this._cameraOffset = new Float32Array(2);
    this._planetCenter = new Float32Array(2);
    this._lightDirection = new Float32Array(2);
    this._lightOrigin = new Float32Array(2);
  }

  async initialize() {
    const [fullscreenVertex, upscaleFragment, starsVertex, starsFragment, galaxyVertex, galaxyFragment, nebulaFragment, terranWaterFragment, terranLandFragment, terranCloudFragment, dryTerranLandFragment, gasLayersFragment, gasRingFragment, lavaLandFragment, lavaCratersFragment, lavaRiversFragment, iceLandFragment, iceLakesFragment, iceCloudsFragment, starBlobsFragment, starSurfaceFragment, starFlaresFragment, asteroidFragment, asteroidBeltVertex, asteroidBeltFragment, simplePointVertex, simplePointFragment, orbitVertex, orbitFragment] = await Promise.all([
      this.loader.load("../common/fullscreen.vert"),
      this.loader.load("../common/upscale.frag"),
      this.loader.load("stars.vert"),
      this.loader.load("stars.frag"),
      this.loader.load("galaxy.vert"),
      this.loader.load("galaxy.frag"),
      this.loader.load("nebula.frag"),
      this.loader.load("../planets/terran/water.frag"),
      this.loader.load("../planets/terran/land.frag"),
      this.loader.load("../planets/terran/clouds.frag"),
      this.loader.load("../planets/dry-terran/land.frag"),
      this.loader.load("../planets/gas/layers.frag"),
      this.loader.load("../planets/gas/ring.frag"),
      this.loader.load("../planets/lava/land.frag"),
      this.loader.load("../planets/lava/craters.frag"),
      this.loader.load("../planets/lava/rivers.frag"),
      this.loader.load("../planets/ice/land.frag"),
      this.loader.load("../planets/ice/lakes.frag"),
      this.loader.load("../planets/ice/clouds.frag"),
      this.loader.load("../star/blobs.frag"),
      this.loader.load("../star/surface.frag"),
      this.loader.load("../star/flares.frag"),
      this.loader.load("../asteroid/asteroid.frag"),
      this.loader.load("../asteroid/belt.vert"),
      this.loader.load("../asteroid/belt.frag"),
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
    this.terranPrograms = [
      new ShaderProgram(gl, fullscreenVertex, terranWaterFragment, "terran-water"),
      new ShaderProgram(gl, fullscreenVertex, terranLandFragment, "terran-land"),
      new ShaderProgram(gl, fullscreenVertex, terranCloudFragment, "terran-clouds"),
    ];
    this.dryTerranProgram = new ShaderProgram(gl, fullscreenVertex, dryTerranLandFragment, "dry-terran-land");
    this.gasPrograms = [
      new ShaderProgram(gl, fullscreenVertex, gasLayersFragment, "gas-layers"),
      new ShaderProgram(gl, fullscreenVertex, gasRingFragment, "gas-ring"),
    ];
    this.lavaPrograms = [
      new ShaderProgram(gl, fullscreenVertex, lavaLandFragment, "lava-land"),
      new ShaderProgram(gl, fullscreenVertex, lavaCratersFragment, "lava-craters"),
      new ShaderProgram(gl, fullscreenVertex, lavaRiversFragment, "lava-rivers"),
    ];
    this.icePrograms = [
      new ShaderProgram(gl, fullscreenVertex, iceLandFragment, "ice-land"),
      new ShaderProgram(gl, fullscreenVertex, iceLakesFragment, "ice-lakes"),
      new ShaderProgram(gl, fullscreenVertex, iceCloudsFragment, "ice-clouds"),
    ];
    this.starPrograms = [
      new ShaderProgram(gl, fullscreenVertex, starBlobsFragment, "star-blobs"),
      new ShaderProgram(gl, fullscreenVertex, starSurfaceFragment, "star-surface"),
      new ShaderProgram(gl, fullscreenVertex, starFlaresFragment, "star-flares"),
    ];
    this.asteroidProgram = new ShaderProgram(gl, fullscreenVertex, asteroidFragment, "asteroid");
    this.asteroidBeltProgram = new ShaderProgram(gl, asteroidBeltVertex, asteroidBeltFragment, "asteroid-belt");
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

  createAsteroidLayer(data) {
    const gl = this.gl;
    const vao = gl.createVertexArray();
    const buffer = gl.createBuffer();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
    const stride = 8 * Float32Array.BYTES_PER_ELEMENT;
    const attributes = [[0, 2, 0], [1, 1, 2], [2, 1, 3], [3, 1, 4], [4, 1, 5], [5, 1, 6]];
    for (const [location, size, componentOffset] of attributes) {
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, size, gl.FLOAT, false, stride, componentOffset * Float32Array.BYTES_PER_ELEMENT);
    }
    gl.bindVertexArray(null);
    return { vao, buffer, capacity: data.length / 8, count: 0 };
  }

  updateAsteroidLayer(layer, data, count) {
    if (!layer) return;
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, layer.buffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, data.subarray(0, count * 8));
    layer.count = count;
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
    this.moonDrawCalls = 0;
    this.asteroidDrawCalls = 0;
    this.asteroidBeltDrawCalls = 0;
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
    gl.uniform1f(program.uniform("uTime"), time.shaderElapsed);
    gl.uniform2f(program.uniform("uCameraOffset"), offset[0], offset[1]);
    gl.uniform1f(program.uniform("uAspect"), this.aspect);
    gl.uniform1f(program.uniform("uZoom"), camera.zoom);
    gl.uniform1f(program.uniform("uGalaxyRotation"), time.shaderElapsed * rotationSpeed);
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
    gl.uniform1f(this.nebulaProgram.uniform("uTime"), time.shaderElapsed);
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

  renderAsteroidBelt(belt, data, count, camera, time) {
    if (!belt || !count || !belt.frontLayer && !belt.backLayer) return;
    const gl = this.gl;
    const layer = data === belt.frontData ? belt.frontLayer : belt.backLayer;
    this.updateAsteroidLayer(layer, data, count);
    const offset = camera.getOffset(this._cameraOffset);
    this.asteroidBeltProgram.use();
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.uniform1f(this.asteroidBeltProgram.uniform("uTime"), time.shaderElapsed);
    gl.uniform1f(this.asteroidBeltProgram.uniform("uAspect"), this.aspect);
    gl.uniform1f(this.asteroidBeltProgram.uniform("uInternalHeight"), this.internalHeight);
    gl.uniform2f(this.asteroidBeltProgram.uniform("uCameraOffset"), offset[0], offset[1]);
    const palette = belt.palette;
    gl.uniform3fv(this.asteroidBeltProgram.uniform("uColor0"), palette.dark);
    gl.uniform3fv(this.asteroidBeltProgram.uniform("uColor1"), palette.base);
    gl.uniform3fv(this.asteroidBeltProgram.uniform("uColor2"), palette.light);
    gl.bindVertexArray(layer.vao);
    gl.drawArrays(gl.POINTS, 0, count);
    this.drawCalls += 1;
    this.asteroidBeltDrawCalls += 1;
  }

  renderPlanet(planet, time, camera) {
    this.renderBody(planet, null, 3, time, camera, "composite");
  }

  renderBody(body, star, lod, time, camera, layerMode = "composite") {
    if (!body || !body.visible) return;
    if (lod === 0) {
      this._renderSimpleBody(body, time, camera);
      return;
    }
    this._beginBodyScissor(body, camera);
    const layers = this._layersFor(body);
    for (let index = 0; index < layers.length; index += 1) {
      const layer = layers[index];
      if (layer.enabled === false) continue;
      if (!this._shouldRenderLayer(layer, index, layerMode)) continue;
      this._renderLayer(body, star, layer, lod, time, camera);
    }
    this.gl.disable(this.gl.SCISSOR_TEST);
  }

  _bodyExtent(body) {
    if (body.kind === "star") return 2.0;
    if (body.kind === "asteroid") return 1.0;
    if (body.type === "gas") return body.hasRings === false && !this.referenceParameters ? 1.0 : 3.0;
    return 1.0;
  }

  _beginBodyScissor(body, camera) {
    const gl = this.gl;
    const offset = camera.getOffset(this._cameraOffset);
    const clipX = body.position[0] + (offset[0] * body.depth) / this.aspect;
    const clipY = body.position[1] + offset[1] * body.depth;
    const padding = 0.015;
    const radius = (body.radius * this._bodyExtent(body) + padding) * this.internalHeight * 0.5;
    const centerX = (clipX * 0.5 + 0.5) * this.internalWidth;
    const centerY = (clipY * 0.5 + 0.5) * this.internalHeight;
    const left = Math.max(0, Math.floor(centerX - radius));
    const bottom = Math.max(0, Math.floor(centerY - radius));
    const right = Math.min(this.internalWidth, Math.ceil(centerX + radius));
    const top = Math.min(this.internalHeight, Math.ceil(centerY + radius));
    gl.enable(gl.SCISSOR_TEST);
    gl.scissor(left, bottom, Math.max(1, right - left), Math.max(1, top - bottom));
  }

  _layersFor(body) {
    if (body.kind === "asteroid") {
      return [{ name: "surface", program: this.asteroidProgram, extent: 1, reference: REFERENCE_PLANET_CONFIG.asteroid.surface }];
    }
    if (body.kind === "star") {
      return [
        { name: "blobs", program: this.starPrograms[0], extent: 2, reference: REFERENCE_PLANET_CONFIG.star.blobs },
        { name: "surface", program: this.starPrograms[1], extent: 1, reference: REFERENCE_PLANET_CONFIG.star.surface },
        { name: "flares", program: this.starPrograms[2], extent: 2, reference: REFERENCE_PLANET_CONFIG.star.flares },
      ];
    }
    if (body.type === "terran") {
      return [
        { name: "water", program: this.terranPrograms[0], extent: 1, reference: REFERENCE_PLANET_CONFIG.terran.water },
        { name: "land", program: this.terranPrograms[1], extent: 1, reference: REFERENCE_PLANET_CONFIG.terran.land },
        { name: "clouds", program: this.terranPrograms[2], extent: 1, reference: REFERENCE_PLANET_CONFIG.terran.clouds },
      ];
    }
    if (body.type === "dry-terran") {
      return [{ name: "land", program: this.dryTerranProgram, extent: 1, reference: REFERENCE_PLANET_CONFIG.dryTerran.land }];
    }
    if (body.type === "islands") {
      return [
        { name: "water", program: this.terranPrograms[0], extent: 1, reference: REFERENCE_PLANET_CONFIG.islands.water },
        { name: "land", program: this.terranPrograms[1], extent: 1, reference: REFERENCE_PLANET_CONFIG.islands.land },
        { name: "clouds", program: this.terranPrograms[2], extent: 1, reference: REFERENCE_PLANET_CONFIG.islands.clouds },
      ];
    }
    if (body.type === "gas") {
      return [
        { name: "gas", program: this.gasPrograms[0], extent: 1, reference: REFERENCE_PLANET_CONFIG.gas.layers },
        { name: "ring", program: this.gasPrograms[1], extent: 3, enabled: body.hasRings !== false || this.referenceParameters, reference: REFERENCE_PLANET_CONFIG.gas.ring },
      ];
    }
    if (body.type === "lava") {
      return [
        { name: "land", program: this.lavaPrograms[0], extent: 1, reference: REFERENCE_PLANET_CONFIG.lava.land },
        { name: "craters", program: this.lavaPrograms[1], extent: 1, reference: REFERENCE_PLANET_CONFIG.lava.craters },
        { name: "rivers", program: this.lavaPrograms[2], extent: 1, reference: REFERENCE_PLANET_CONFIG.lava.rivers },
      ];
    }
    if (body.type === "no-atmosphere" || body.type === "rocky") {
      const reference = body.type === "rocky" ? REFERENCE_PLANET_CONFIG.rocky : REFERENCE_PLANET_CONFIG.noAtmosphere;
      return [
        { name: "land", program: this.lavaPrograms[0], extent: 1, reference: reference.land },
        { name: "craters", program: this.lavaPrograms[1], extent: 1, reference: reference.craters },
      ];
    }
    return [
      { name: "land", program: this.icePrograms[0], extent: 1, reference: REFERENCE_PLANET_CONFIG.ice.land },
      { name: "lakes", program: this.icePrograms[1], extent: 1, reference: REFERENCE_PLANET_CONFIG.ice.lakes },
      { name: "clouds", program: this.icePrograms[2], extent: 1, reference: REFERENCE_PLANET_CONFIG.ice.clouds },
    ];
  }

  _shouldRenderLayer(layer, index, mode) {
    if (!mode || mode === "composite") return true;
    if (/^\d+$/.test(String(mode))) return index === Number(mode);
    return layer.name === String(mode).toLowerCase();
  }

  _setLayerCommon(program, body, layer, time, camera, lightBody) {
    const gl = this.gl;
    const offset = camera.getOffset(this._cameraOffset);
    this._planetCenter[0] = body.position[0] * this.aspect;
    this._planetCenter[1] = body.position[1];
    const reference = layer.reference;
    const layerRadius = body.radius * layer.extent;
    const pixels = this.referenceParameters
      ? reference.pixels
      : Math.max(10, Math.round(layerRadius * this.internalHeight));
    const timeSpeed = reference.timeSpeed;
    const updateFactor = reference.updateFactor ?? 0.02;
    const layerTime = this.timeForShader(time) * this.animationDebugSpeed
      * (Math.round(reference.size ?? 1) * 2.0 / Math.max(timeSpeed, 0.0001)) * updateFactor;
    const seed = this.referenceParameters
      ? reference.seed
      : 1.0 + body.seed01 * 9.0;
    let dynamicRotation = body.rotation ?? body.initialRotation ?? 0;
    if (body.kind === "star") dynamicRotation = (body.initialRotation ?? 0) + this.timeForShader(time) * (body.rotationSpeed ?? 0);
    if (layer.name === "clouds" && body.cloudInitialRotation !== undefined) {
      dynamicRotation = body.cloudInitialRotation + this.timeForShader(time) * (body.cloudRotationSpeed ?? 0);
    }
    const rotation = this.referenceParameters ? (reference.rotation ?? 0) : dynamicRotation;
    const lightOrigin = this._layerLightOrigin(body, lightBody);
    program.use();
    gl.uniform1f(program.uniform("uTime"), layerTime);
    gl.uniform1f(program.uniform("uAspect"), this.aspect);
    gl.uniform1f(program.uniform("uInternalHeight"), this.internalHeight);
    gl.uniform1f(program.uniform("uPixels"), pixels);
    gl.uniform1f(program.uniform("uLayerRadius"), layerRadius);
    gl.uniform1f(program.uniform("uDepth"), body.depth);
    gl.uniform1f(program.uniform("uSeed"), seed);
    gl.uniform1f(program.uniform("uRotation"), rotation);
    gl.uniform1f(program.uniform("uTimeSpeed"), timeSpeed);
    gl.uniform1f(program.uniform("uDepth"), body.depth);
    gl.uniform2fv(program.uniform("uCenter"), this._planetCenter);
    gl.uniform2f(program.uniform("uCameraOffset"), offset[0], offset[1]);
    gl.uniform2f(program.uniform("uLightOrigin"), lightOrigin[0], lightOrigin[1]);
    gl.uniform1i(program.uniform("uDitherEnabled"), 1);
  }

  timeForShader(time) {
    return time.shaderElapsed ?? time.elapsed;
  }

  _layerLightOrigin(body, lightBody) {
    if (this.referenceParameters) {
      const defaults = body.kind === "star" ? [0.5, 0.5]
        : body.type === "gas" ? [-0.1, 0.3]
          : body.type === "lava" || body.type === "ice" || body.type === "no-atmosphere" || body.type === "rocky" ? [0.3, 0.3]
            : body.type === "asteroid" ? [0.25, 0.25] : [0.39, 0.39];
      this._lightOrigin[0] = defaults[0];
      this._lightOrigin[1] = defaults[1];
      return this._lightOrigin;
    }
    if (!lightBody?.position || body.kind === "star") {
      this._lightOrigin[0] = 0.39;
      this._lightOrigin[1] = 0.39;
      return this._lightOrigin;
    }
    this._lightDirection[0] = (lightBody.position[0] - body.position[0]) * this.aspect;
    this._lightDirection[1] = lightBody.position[1] - body.position[1];
    const length = Math.hypot(this._lightDirection[0], this._lightDirection[1]) || 1;
    this._lightOrigin[0] = 0.5 + (this._lightDirection[0] / length) * 0.5;
    this._lightOrigin[1] = 0.5 + (this._lightDirection[1] / length) * 0.5;
    return this._lightOrigin;
  }

  _renderLayer(body, lightBody, layer, lod, time, camera) {
    const gl = this.gl;
    this._setLayerCommon(layer.program, body, layer, time, camera, lightBody);
    this._setLayerParams(layer.program, body, layer, lod);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.bindVertexArray(this.quadVao);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    this.drawCalls += 1;
    if (body.kind === "star") this.starDrawCalls += 1;
    if (body.kind === "planet") this.planetDrawCalls += 1;
    if (body.kind === "moon") this.moonDrawCalls += 1;
    if (body.kind === "asteroid") this.asteroidDrawCalls += 1;
  }

  _setLayerParams(program, body, layer, lod) {
    const gl = this.gl;
    const ref = layer.reference;
    const seed = this.referenceParameters ? ref.seed : 1.0 + body.seed01 * 9.0;
    const size = this.referenceParameters ? ref.size : this._proceduralLayerSize(body, layer.name);
    const octaves = this.referenceParameters ? (ref.octaves ?? body.octaves ?? 4) : Math.min(6, Math.max(2, body.octaves ?? 4));
    const effectiveOctaves = lod <= 1 ? Math.min(2, octaves) : lod === 2 ? Math.min(3, octaves) : octaves;
    gl.uniform1f(program.uniform("uSize"), size);
    gl.uniform1i(program.uniform("uOctaves"), effectiveOctaves);

    if (body.kind === "star") this._setStarLayerParams(program, body, layer, seed, size, effectiveOctaves);
    else if (body.kind === "asteroid") this._setAsteroidLayerParams(program, body, layer, seed, size, effectiveOctaves);
    else if (body.type === "dry-terran") this._setDryTerranLayerParams(program, body, layer, seed, size, effectiveOctaves);
    else if (body.type === "terran" || body.type === "islands") this._setTerranLayerParams(program, body, layer, seed, size, effectiveOctaves);
    else if (body.type === "gas") this._setGasLayerParams(program, body, layer, seed, size, effectiveOctaves);
    else if (body.type === "lava") this._setLavaLayerParams(program, body, layer, seed, size, effectiveOctaves);
    else if (body.type === "no-atmosphere" || body.type === "rocky") this._setRockyLayerParams(program, body, layer, seed, size, effectiveOctaves);
    else this._setIceLayerParams(program, body, layer, seed, size, effectiveOctaves);
  }

  _proceduralLayerSize(body, layerName) {
    if (body.kind === "star") return layerName === "surface" ? 4.463 : layerName === "blobs" ? 4.93 : 1.6;
    if (body.kind === "asteroid") return 5.294;
    if (body.type === "dry-terran") return 8;
    if (body.type === "terran" || body.type === "islands") return layerName === "clouds" ? body.cloudScale : body.terrainScale;
    if (body.type === "gas") return layerName === "ring" ? 15 : 10.107;
    if (body.type === "lava") return layerName === "craters" ? 3.5 : 10;
    if (body.type === "no-atmosphere" || body.type === "rocky") return layerName === "craters" ? 3.5 : 10;
    return layerName === "clouds" ? 4 : layerName === "lakes" ? 10 : 8;
  }

  _colors(referenceGroup, fallbackGroup, count) {
    const values = this.referencePalette ? referenceGroup : fallbackGroup;
    return values.slice(0, count);
  }

  _setColor(program, name, color, alpha = null) {
    const values = alpha === null ? color : [...color, alpha];
    if (alpha === null) this.gl.uniform3fv(program.uniform(name), values);
    else this.gl.uniform4fv(program.uniform(name), values);
  }

  _setTerranLayerParams(program, body, layer, seed, size, octaves) {
    const ref = body.type === "islands" ? REFERENCE_PALETTES.islands : REFERENCE_PALETTES.terran;
    const palette = body.palette;
    if (layer.name === "water") {
      this._setColor(program, "uColor0", this._colors(ref.water, [palette.oceanLight, palette.oceanDark, palette.oceanDark], 3)[0]);
      this._setColor(program, "uColor1", this._colors(ref.water, [palette.oceanLight, palette.oceanDark, palette.oceanDark], 3)[1]);
      this._setColor(program, "uColor2", this._colors(ref.water, [palette.oceanLight, palette.oceanDark, palette.oceanDark], 3)[2]);
      this._setLayerFloat(program, "uDitherSize", this.referenceParameters ? 2 : 2);
      this._setLayerFloat(program, "uLightBorder1", this.referenceParameters ? layer.reference.lightBorder1 : 0.4);
      this._setLayerFloat(program, "uLightBorder2", this.referenceParameters ? layer.reference.lightBorder2 : 0.6);
    } else if (layer.name === "land") {
      const colors = this._colors(ref.land, [palette.landLight, palette.landBase, palette.landDark, palette.landDark], 4);
      for (let index = 0; index < 4; index += 1) this._setColor(program, `uColor${index}`, colors[index], 1);
      this._setLayerFloat(program, "uLandCutoff", this.referenceParameters ? layer.reference.landCutoff : body.seaLevel);
      this._setLayerFloat(program, "uLightBorder1", this.referenceParameters ? layer.reference.lightBorder1 : 0.32);
      this._setLayerFloat(program, "uLightBorder2", this.referenceParameters ? layer.reference.lightBorder2 : 0.534);
    } else {
      const colors = this._colors(ref.clouds, [
        [...palette.cloudLight], [...palette.cloudLight], [...palette.cloudShadow], [...palette.cloudShadow],
      ], 4);
      for (let index = 0; index < 4; index += 1) this._setColor(program, `uColor${index}`, colors[index], 1);
      this._setLayerFloat(program, "uCloudCover", this.referenceParameters ? layer.reference.cloudCover : body.cloudCoverage);
      this._setLayerFloat(program, "uStretch", this.referenceParameters ? layer.reference.stretch : 2);
      this._setLayerFloat(program, "uCloudCurve", this.referenceParameters ? layer.reference.cloudCurve : 1.3);
      this._setLayerFloat(program, "uLightBorder1", this.referenceParameters ? layer.reference.lightBorder1 : 0.52);
      this._setLayerFloat(program, "uLightBorder2", this.referenceParameters ? layer.reference.lightBorder2 : 0.62);
    }
    this._setLayerFloat(program, "uSeed", seed);
    this._setLayerFloat(program, "uSize", size);
    this._setLayerInt(program, "uOctaves", octaves);
  }

  _setDryTerranLayerParams(program, body, layer, seed, size, octaves) {
    const palette = this._colors(REFERENCE_PALETTES.dryTerran.land, [body.palette.landLight, body.palette.landBase, body.palette.landDark, body.palette.landDark, body.palette.landDark], 5);
    for (let index = 0; index < 5; index += 1) this._setColor(program, `uColor${index}`, palette[index]);
    this._setLayerFloat(program, "uLightDistance1", this.referenceParameters ? layer.reference.lightDistance1 : 0.36);
    this._setLayerFloat(program, "uLightDistance2", this.referenceParameters ? layer.reference.lightDistance2 : 0.53);
    this._setLayerFloat(program, "uSeed", seed);
    this._setLayerFloat(program, "uSize", size);
    this._setLayerInt(program, "uOctaves", octaves);
  }

  _setAsteroidLayerParams(program, body, layer, seed, size, octaves) {
    const colors = this._colors(REFERENCE_PALETTES.asteroid.surface, [body.palette.light, body.palette.base, body.palette.dark], 3);
    for (let index = 0; index < 3; index += 1) this._setColor(program, `uColor${index}`, colors[index]);
    this._setLayerFloat(program, "uSeed", seed);
    this._setLayerFloat(program, "uSize", size);
    this._setLayerInt(program, "uOctaves", octaves);
  }

  _setRockyLayerParams(program, body, layer, seed, size, octaves) {
    const group = body.type === "rocky" ? REFERENCE_PALETTES.rocky : REFERENCE_PALETTES.noAtmosphere;
    const palette = body.palette ?? {};
    if (layer.name === "land") {
      const colors = this._colors(group.land, [palette.crust, palette.crustDark, palette.crustDark], 3);
      for (let index = 0; index < 3; index += 1) this._setColor(program, `uColor${index}`, colors[index]);
      this._setLayerFloat(program, "uDitherSize", 2);
      this._setLayerFloat(program, "uLightBorder1", this.referenceParameters ? layer.reference.lightBorder1 : 0.4);
      this._setLayerFloat(program, "uLightBorder2", this.referenceParameters ? layer.reference.lightBorder2 : 0.6);
    } else {
      const colors = this._colors(group.craters, [palette.crustDark, palette.crust], 2);
      this._setColor(program, "uColor0", colors[0]);
      this._setColor(program, "uColor1", colors[1]);
      this._setLayerFloat(program, "uLightBorder", this.referenceParameters ? layer.reference.lightBorder : 0.4);
    }
    this._setLayerFloat(program, "uSeed", seed);
    this._setLayerFloat(program, "uSize", size);
    this._setLayerInt(program, "uOctaves", octaves);
  }

  _setGasLayerParams(program, body, layer, seed, size, octaves) {
    const ref = REFERENCE_PALETTES.gas;
    const palette = body.palette;
    if (layer.name === "gas") {
      const colors = this._colors(ref.layers, [palette.light, palette.base, palette.dark], 3);
      const darkColors = this._colors(ref.layersDark, [palette.base, palette.dark, palette.dark], 3);
      for (let index = 0; index < 3; index += 1) {
        this._setColor(program, `uColor${index}`, colors[index]);
        this._setColor(program, `uDarkColor${index}`, darkColors[index]);
      }
      this._setLayerFloat(program, "uCloudCover", this.referenceParameters ? layer.reference.cloudCover : 0.61);
      this._setLayerFloat(program, "uStretch", this.referenceParameters ? layer.reference.stretch : 2.204);
      this._setLayerFloat(program, "uCloudCurve", this.referenceParameters ? layer.reference.cloudCurve : 1.376);
      this._setLayerFloat(program, "uBands", this.referenceParameters ? layer.reference.bands : Math.max(0.5, body.bandFrequency / 6));
      this._setLayerFloat(program, "uLightBorder1", this.referenceParameters ? layer.reference.lightBorder1 : 0.52);
      this._setLayerFloat(program, "uLightBorder2", this.referenceParameters ? layer.reference.lightBorder2 : 0.62);
    } else {
      const colors = this._colors(ref.ring, [palette.ring, palette.ring, palette.base], 3);
      const darkColors = this._colors(ref.ringDark, [palette.dark, palette.dark, palette.dark], 3);
      for (let index = 0; index < 3; index += 1) {
        this._setColor(program, `uColor${index}`, colors[index]);
        this._setColor(program, `uDarkColor${index}`, darkColors[index]);
      }
      this._setLayerFloat(program, "uRingWidth", this.referenceParameters ? layer.reference.ringWidth : body.ringWidth);
      this._setLayerFloat(program, "uRingPerspective", this.referenceParameters ? layer.reference.ringPerspective : 6);
      this._setLayerFloat(program, "uScaleRelative", this.referenceParameters ? layer.reference.scaleRelative : 6);
      this._setLayerFloat(program, "uLightBorder1", this.referenceParameters ? layer.reference.lightBorder1 : 0.52);
      this._setLayerFloat(program, "uLightBorder2", this.referenceParameters ? layer.reference.lightBorder2 : 0.62);
    }
    this._setLayerFloat(program, "uSeed", seed);
    this._setLayerFloat(program, "uSize", size);
    this._setLayerInt(program, "uOctaves", octaves);
  }

  _setLavaLayerParams(program, body, layer, seed, size, octaves) {
    const ref = REFERENCE_PALETTES.lava;
    const palette = body.palette;
    if (layer.name === "land") {
      const colors = this._colors(ref.land, [palette.crust, palette.crustDark, palette.crustDark], 3);
      for (let index = 0; index < 3; index += 1) this._setColor(program, `uColor${index}`, colors[index]);
      this._setLayerFloat(program, "uDitherSize", 2);
      this._setLayerFloat(program, "uLightBorder1", this.referenceParameters ? layer.reference.lightBorder1 : 0.4);
      this._setLayerFloat(program, "uLightBorder2", this.referenceParameters ? layer.reference.lightBorder2 : 0.6);
    } else if (layer.name === "craters") {
      const colors = this._colors(ref.craters, [palette.crustDark, palette.crust], 2);
      this._setColor(program, "uColor0", colors[0]);
      this._setColor(program, "uColor1", colors[1]);
      this._setLayerFloat(program, "uLightBorder", this.referenceParameters ? layer.reference.lightBorder : 0.4);
    } else {
      const colors = this._colors(ref.rivers, [palette.hot, palette.hot, palette.glow], 3);
      for (let index = 0; index < 3; index += 1) this._setColor(program, `uColor${index}`, colors[index]);
      this._setLayerFloat(program, "uRiverCutoff", this.referenceParameters ? layer.reference.riverCutoff : body.lavaThreshold);
      this._setLayerFloat(program, "uLightBorder1", this.referenceParameters ? layer.reference.lightBorder1 : 0.019);
      this._setLayerFloat(program, "uLightBorder2", this.referenceParameters ? layer.reference.lightBorder2 : 0.036);
    }
    this._setLayerFloat(program, "uSeed", seed);
    this._setLayerFloat(program, "uSize", size);
    this._setLayerInt(program, "uOctaves", octaves);
  }

  _setIceLayerParams(program, body, layer, seed, size, octaves) {
    const ref = REFERENCE_PALETTES.ice;
    const palette = body.palette;
    if (layer.name === "land") {
      const colors = this._colors(ref.land, [palette.light, palette.base, palette.dark], 3);
      for (let index = 0; index < 3; index += 1) this._setColor(program, `uColor${index}`, colors[index]);
      this._setLayerFloat(program, "uDitherSize", 2);
      this._setLayerFloat(program, "uLightBorder1", this.referenceParameters ? layer.reference.lightBorder1 : 0.48);
      this._setLayerFloat(program, "uLightBorder2", this.referenceParameters ? layer.reference.lightBorder2 : 0.632);
    } else if (layer.name === "lakes") {
      const colors = this._colors(ref.lakes, [palette.crack, palette.base, palette.dark], 3);
      for (let index = 0; index < 3; index += 1) this._setColor(program, `uColor${index}`, colors[index]);
      this._setLayerFloat(program, "uLakeCutoff", this.referenceParameters ? layer.reference.lakeCutoff : body.iceCoverage);
      this._setLayerFloat(program, "uLightBorder1", this.referenceParameters ? layer.reference.lightBorder1 : 0.024);
      this._setLayerFloat(program, "uLightBorder2", this.referenceParameters ? layer.reference.lightBorder2 : 0.047);
    } else {
      const colors = this._colors(ref.clouds, [
        [...palette.light], [...palette.light], [...palette.base], [...palette.dark],
      ], 4);
      for (let index = 0; index < 4; index += 1) this._setColor(program, `uColor${index}`, colors[index], 1);
      this._setLayerFloat(program, "uCloudCover", this.referenceParameters ? layer.reference.cloudCover : 0.546);
      this._setLayerFloat(program, "uStretch", this.referenceParameters ? layer.reference.stretch : 2.5);
      this._setLayerFloat(program, "uCloudCurve", this.referenceParameters ? layer.reference.cloudCurve : 1.3);
      this._setLayerFloat(program, "uLightBorder1", this.referenceParameters ? layer.reference.lightBorder1 : 0.566);
      this._setLayerFloat(program, "uLightBorder2", this.referenceParameters ? layer.reference.lightBorder2 : 0.781);
    }
    this._setLayerFloat(program, "uSeed", seed);
    this._setLayerFloat(program, "uSize", size);
    this._setLayerInt(program, "uOctaves", octaves);
  }

  _setStarLayerParams(program, body, layer, seed, size, octaves) {
    const ref = REFERENCE_PALETTES.star;
    const palette = body.palette;
    if (layer.name === "blobs") {
      const color = this.referencePalette ? ref.blobs[0] : palette.light;
      this._setColor(program, "uColor", color, 1);
      this._setLayerFloat(program, "uCircleAmount", this.referenceParameters ? layer.reference.circleAmount : 2);
      this._setLayerFloat(program, "uCircleSize", this.referenceParameters ? layer.reference.circleSize : 1);
    } else if (layer.name === "surface") {
      const colors = this._colors(ref.surface, [palette.light, palette.base, palette.dark, palette.dark], 4);
      for (let index = 0; index < 4; index += 1) this._setColor(program, `uColor${index}`, colors[index], 1);
      this._setLayerFloat(program, "uTiles", this.referenceParameters ? layer.reference.tiles : 1);
    } else {
      const colors = this._colors(ref.flares, [palette.flare, palette.light], 2);
      this._setColor(program, "uColor0", colors[0], 1);
      this._setColor(program, "uColor1", colors[1], 1);
      this._setLayerFloat(program, "uStormWidth", this.referenceParameters ? layer.reference.stormWidth : 0.3);
      this._setLayerFloat(program, "uStormDitherWidth", this.referenceParameters ? layer.reference.stormDitherWidth : 0);
      this._setLayerFloat(program, "uScale", this.referenceParameters ? layer.reference.scale : 1);
      this._setLayerFloat(program, "uCircleAmount", this.referenceParameters ? layer.reference.circleAmount : 2);
      this._setLayerFloat(program, "uCircleScale", this.referenceParameters ? layer.reference.circleScale : 1);
    }
    this._setLayerFloat(program, "uSeed", seed);
    this._setLayerFloat(program, "uSize", size);
    this._setLayerInt(program, "uOctaves", octaves);
  }

  _setLayerFloat(program, name, value) {
    this.gl.uniform1f(program.uniform(name), value);
  }

  _setLayerInt(program, name, value) {
    this.gl.uniform1i(program.uniform(name), value);
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
    if (body.kind === "moon") this.moonDrawCalls += 1;
    if (body.kind === "asteroid") this.asteroidDrawCalls += 1;
  }

  _bodyColor(body) {
    if (body.kind === "star") return body.palette.base;
    if (body.type === "terran" || body.type === "dry-terran" || body.type === "islands") return body.palette.landBase;
    if (body.type === "gas") return body.palette.base;
    if (body.type === "lava" || body.type === "no-atmosphere" || body.type === "rocky") return body.palette.crust;
    if (body.type === "asteroid") return body.palette.base;
    return body.palette.base;
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
