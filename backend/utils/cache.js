/**
 * Cache TTL đơn giản trong bộ nhớ — đủ dùng cho 1 instance backend / dữ liệu ít thay
 * đổi theo giây (dashboard stats...). Nếu scale nhiều instance sau này thì thay bằng Redis.
 *
 *   const cache = require('../utils/cache');
 *   const stats = await cache.wrap('dashboard-stats', 60_000, () => computeStats());
 */
const store = new Map(); // key -> { value, expiresAt }

function wrap(key, ttlMs, computeFn) {
  const cached = store.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return Promise.resolve(cached.value);
  }

  return Promise.resolve(computeFn()).then((value) => {
    store.set(key, { value, expiresAt: Date.now() + ttlMs });
    return value;
  });
}

function invalidate(key) {
  store.delete(key);
}

module.exports = { wrap, invalidate };
