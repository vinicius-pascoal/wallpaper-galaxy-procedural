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
    this._cameraOffset = new Float32Array(2);
  }

  async initialize() {
    const [fullscreenVertex, upscaleFragment, starsVertex, starsFragment, galaxyVertex, galaxyFragment] = await Promise.all([
      this.loader.load("../common/fullscreen.vert"),
      this.loader.load("../common/upscale.frag"),
      this.loader.load("stars.vert"),
      this.loader.load("stars.frag"),
      this.loader.load("galaxy.vert"),
      this.loader.load("galaxy.frag"),
    ]);

    const gl = this.gl;
    this.upscaleProgram = new ShaderProgram(gl, fullscreenVertex, upscaleFragment, "upscale");
    this.starsProgram = new ShaderProgram(gl, starsVertex, starsFragment, "stars");
    this.galaxyProgram = new ShaderProgram(gl, galaxyVertex, galaxyFragment, "galaxy");

    this.quadVao = gl.createVertexArray();
    this.quadBuffer = gl.createBuffer();
    gl.bindVertexArray(this.quadVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
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
