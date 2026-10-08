export class ShaderLoader {
  constructor(baseUrl = import.meta.url) {
    this.baseUrl = baseUrl;
    this.cache = new Map();
  }

  async load(path) {
    const url = new URL(path, this.baseUrl).href;
    return this._loadUrl(url, []);
  }

  async _loadUrl(url, stack) {
    if (this.cache.has(url)) {
      return this.cache.get(url);
    }
    if (stack.includes(url)) {
      throw new Error(`Ciclo de include GLSL detectado: ${[...stack, url].join(" → ")}`);
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Não foi possível carregar shader (${response.status}): ${url}`);
    }

    const source = (await response.text()).replace(/^\uFEFF/, "");
    const includePattern = /^[ \t]*#include[ \t]+["<]([^">]+)[">][ \t]*$/gm;
    let result = "";
    let cursor = 0;

    for (const match of source.matchAll(includePattern)) {
      result += source.slice(cursor, match.index);
      const includeUrl = new URL(match[1], url).href;
      result += await this._loadUrl(includeUrl, [...stack, url]);
      cursor = match.index + match[0].length;
    }
    result += source.slice(cursor);

    this.cache.set(url, result);
    return result;
  }
}
