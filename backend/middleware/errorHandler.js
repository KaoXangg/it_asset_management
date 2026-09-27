const ApiError = require('../utils/ApiError');

/**
 * Middleware xử lý lỗi tập trung — mọi controller chỉ cần `throw new ApiError(...)`
 * hoặc để lỗi bất ngờ rơi xuống đây, response trả về luôn có format nhất quán:
 *   { error: string, details?: any }
 *
 * Nhận diện thêm một số lỗi phổ biến từ mssql driver để không phải catch thủ công
 * ở từng controller (trùng khóa chính, vi phạm khóa ngoại...).
 */
function errorHandler(err, req, res, next) {
  // Lỗi từ multer (upload ảnh): sai định dạng, quá dung lượng cho phép...
  if (err.name === 'MulterError' || /^Chỉ chấp nhận ảnh/.test(err.message || '')) {
    return res.status(400).json({ error: err.message });
  }

  // Lỗi nghiệp vụ tự throw (ApiError) — tin tưởng status/message
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
  }

  // Lỗi validate từ express-validator (nếu lọt tới đây thay vì bị chặn ở middleware validate)
  if (err.array && typeof err.array === 'function') {
    return res.status(400).json({ error: 'Dữ liệu không hợp lệ', details: err.array() });
  }

  // Lỗi phổ biến từ SQL Server (mssql driver)
  if (err.number === 2627 || err.number === 2601) {
    return res.status(400).json({ error: 'Dữ liệu bị trùng (vi phạm ràng buộc UNIQUE)' });
  }
  if (err.number === 547) {
    return res.status(400).json({ error: 'Không thể thực hiện vì tài sản/bản ghi đang được tham chiếu ở nơi khác' });
  }

  // Lỗi không xác định — log đầy đủ ở server, không trả stack trace ra client
  console.error('[Unhandled error]', err);
  return res.status(500).json({ error: 'Đã có lỗi xảy ra ở server, vui lòng thử lại sau' });
}

module.exports = errorHandler;
