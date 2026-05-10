export class TtlCache {
  constructor(ttlHours) {
    this.ttlMs = ttlHours * 60 * 60 * 1000;
    this.items = new Map();
  }

  get(key) {
    const item = this.items.get(key);
    if (!item) return null;
    if (Date.now() - item.createdAt > this.ttlMs) {
      this.items.delete(key);
      return null;
    }
    return item.value;
  }

  set(key, value) {
    this.items.set(key, { value, createdAt: Date.now() });
  }
}
