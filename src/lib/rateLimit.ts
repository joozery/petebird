// Minimal in-memory login throttle. Resets when the server process restarts —
// good enough to blunt casual brute-forcing on a single small Node process,
// not a substitute for a shared store if this ever runs multi-instance.
const attempts = new Map<string, { count: number; lockedUntil: number }>();

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

export function isLoginLocked(key: string): boolean {
  const entry = attempts.get(key);
  if (!entry) return false;
  if (entry.lockedUntil && entry.lockedUntil > Date.now()) return true;
  if (entry.lockedUntil && entry.lockedUntil <= Date.now()) attempts.delete(key);
  return false;
}

export function recordLoginFailure(key: string) {
  const entry = attempts.get(key) ?? { count: 0, lockedUntil: 0 };
  entry.count += 1;
  if (entry.count >= MAX_ATTEMPTS) entry.lockedUntil = Date.now() + LOCKOUT_MS;
  attempts.set(key, entry);
}

export function clearLoginFailures(key: string) {
  attempts.delete(key);
}
