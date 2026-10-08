const FNV_OFFSET = 2166136261;

function hashString(value) {
  let hash = FNV_OFFSET;
  const text = String(value);
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function hashSeed(parentSeed, identifier) {
  const parent = Number(parentSeed) >>> 0;
  const child = typeof identifier === "number" ? Number(identifier) >>> 0 : hashString(identifier);
  let value = (parent ^ child ^ 0x9e3779b9) >>> 0;
  value = Math.imul(value ^ (value >>> 16), 2246822507) >>> 0;
  value = Math.imul(value ^ (value >>> 13), 3266489909) >>> 0;
  return (value ^ (value >>> 16)) >>> 0;
}

export function hash01(...values) {
  let seed = FNV_OFFSET;
  for (const value of values) {
    seed = hashSeed(seed, value);
  }
  return seed / 4294967296;
}
