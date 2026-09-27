// Rate limiter đơn giản theo IP, lưu trong bộ nhớ (đủ dùng cho đồ án / traffic nhỏ).
// Với production nhiều instance nên chuyển sang Redis.

const requestLog = new Map(); // ip -> [timestamps]
const WINDOW_MS = 60 * 1000;   // cửa sổ 1 phút
const MAX_REQUESTS = 15;       // tối đa 15 tin nhắn / phút / IP

function chatRateLimit(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();

  const timestamps = (requestLog.get(ip) || []).filter(t => now - t < WINDOW_MS);

  if (timestamps.length >= MAX_REQUESTS) {
    return res.status(429).json({ error: 'Bạn gửi quá nhiều tin nhắn, vui lòng thử lại sau ít phút.' });
  }

  timestamps.push(now);
  requestLog.set(ip, timestamps);

  // Dọn dẹp định kỳ để tránh Map phình to
  if (requestLog.size > 1000) {
    for (const [key, times] of requestLog.entries()) {
      if (times.every(t => now - t >= WINDOW_MS)) {
        requestLog.delete(key);
      }
    }
  }

  next();
}

module.exports = chatRateLimit;
