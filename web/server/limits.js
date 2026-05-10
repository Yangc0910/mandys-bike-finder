export class DailyLimitStore {
  constructor() {
    this.counters = new Map();
  }

  check(scope, key, limit) {
    if (limit <= 0) {
      return { allowed: false, used: 0, limit };
    }
    const id = `${dayKey()}:${scope}:${key}`;
    const used = this.counters.get(id) || 0;
    if (used >= limit) {
      return { allowed: false, used, limit };
    }
    this.counters.set(id, used + 1);
    return { allowed: true, used: used + 1, limit };
  }

  snapshot(scope, key, limit) {
    const used = this.counters.get(`${dayKey()}:${scope}:${key}`) || 0;
    return { used, limit };
  }
}

function dayKey() {
  return new Date().toISOString().slice(0, 10);
}
