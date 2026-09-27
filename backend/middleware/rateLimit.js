/**
 * Rate limiter đơn giản theo IP, lưu trong bộ nhớ (đủ cho 1 instance / traffic nhỏ).
 * Dùng chung cho các route nhạy cảm (login, register) thay vì chỉ có ở /chat.
 * Nếu scale nhiều instance sau này, nên chuyển sang Redis.
 *
 *   const rateLimit = require('../middleware/rateLimit');
 *   router.post('/login', rateLimit({ windowMs: 60_000, max: 10 }), authController.login);
 */
function rateLimit({ windowMs = 60 * 1000, max = 10, message } = {}) {
  const requestLog = new Map(); // key -> [timestamps]

  return function (req, res, next) {
    const key = req.ip || req.connection?.remoteAddress || 'unknown';
    const now = Date.now();

    const timestamps = (requestLog.get(key) || []).filter((t) => now - t < windowMs);

    if (timestamps.length >= max) {
      return res.status(429).json({
        error: message || 'Bạn thao tác quá nhiều lần, vui lòng thử lại sau ít phút.',
      });
    }

    timestamps.push(now);
    requestLog.set(key, timestamps);

    if (requestLog.size > 5000) {
      for (const [k, times] of requestLog.entries()) {
        if (times.every((t) => now - t >= windowMs)) {
          requestLog.delete(k);
        }
      }
    }

    next();
  };
}

module.exports = rateLimit;
