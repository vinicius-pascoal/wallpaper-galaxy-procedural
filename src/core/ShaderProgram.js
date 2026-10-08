export class ShaderProgram {
  constructor(gl, vertexSource, fragmentSource, label = "shader") {
    this.gl = gl;
    this.label = label;
    const vertex = this._compile(gl.VERTEX_SHADER, vertexSource);
    const fragment = this._compile(gl.FRAGMENT_SHADER, fragmentSource);
    this.handle = gl.createProgram();
    gl.attachShader(this.handle, vertex);
    gl.attachShader(this.handle, fragment);
    gl.linkProgram(this.handle);

    if (!gl.getProgramParameter(this.handle, gl.LINK_STATUS)) {
      const log = gl.getProgramInfoLog(this.handle) || "sem detalhes";
      throw new Error(`Falha ao vincular ${label}: ${log}`);
    }

    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    this.uniforms = new Map();
  }

  _compile(type, source) {
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const log = this.gl.getShaderInfoLog(shader) || "sem detalhes";
      throw new Error(`Falha ao compilar ${this.label}: ${log}`);
    }
    return shader;
  }

  use() {
    this.gl.useProgram(this.handle);
  }

  uniform(name) {
    if (!this.uniforms.has(name)) {
      this.uniforms.set(name, this.gl.getUniformLocation(this.handle, name));
    }
    return this.uniforms.get(name);
  }
}
