import { classifyPropertyChanges, DEFAULT_PROPERTIES, normalizeProperties } from "./WallpaperProperties.js";

export class WallpaperState {
  constructor(initial = {}) {
    this.value = normalizeProperties(initial, DEFAULT_PROPERTIES);
    this.listeners = new Set();
  }

  subscribe(listener) {
    if (typeof listener !== "function") return () => {};
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  update(raw) {
    const next = normalizeProperties(raw, this.value);
    const changes = classifyPropertyChanges(this.value, next);
    if (!changes.changed.length) return changes;
    const previous = this.value;
    this.value = next;
    for (const listener of this.listeners) listener(next, previous, changes);
    return changes;
  }

  get(name) {
    return this.value[name];
  }

  toJSON() {
    return { ...this.value };
  }
}
