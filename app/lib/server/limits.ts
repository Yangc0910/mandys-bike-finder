const dailyCounters = new Map<string, number>();
const sessionCounters = new Map<string, number>();

export function checkDailyLimit(scope: string, key: string, limit: number) {
  if (limit <= 0) return { allowed: false, used: 0, limit };
  const id = `${new Date().toISOString().slice(0, 10)}:${scope}:${key}`;
  const used = dailyCounters.get(id) || 0;
  if (used >= limit) return { allowed: false, used, limit };
  dailyCounters.set(id, used + 1);
  return { allowed: true, used: used + 1, limit };
}

export function checkSessionLimit(scope: string, key: string, limit: number) {
  if (limit <= 0) return { allowed: false, used: 0, limit };
  const id = `${scope}:${key}`;
  const used = sessionCounters.get(id) || 0;
  if (used >= limit) return { allowed: false, used, limit };
  sessionCounters.set(id, used + 1);
  return { allowed: true, used: used + 1, limit };
}

export function checkUsageLimits(
  scope: string,
  key: string,
  dailyLimit: number,
  sessionLimit: number,
) {
  const session = checkSessionLimit(scope, key, sessionLimit);
  if (!session.allowed) {
    return { allowed: false, reason: "session", session, daily: { used: 0, limit: dailyLimit } };
  }
  const daily = checkDailyLimit(scope, key, dailyLimit);
  if (!daily.allowed) {
    return { allowed: false, reason: "daily", session, daily };
  }
  return { allowed: true, reason: "", session, daily };
}
