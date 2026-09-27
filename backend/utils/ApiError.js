/**
 * ApiError — lỗi nghiệp vụ có status code rõ ràng, để controller "throw" thay vì
 * tự viết res.status(...).json(...) rải rác ở khắp nơi.
 *
 * Dùng chung với middleware/errorHandler.js + utils/catchAsync.js:
 *
 *   const ApiError = require('../utils/ApiError');
 *   const catchAsync = require('../utils/catchAsync');
 *
 *   exports.getAssetById = catchAsync(async (req, res) => {
 *     const asset = await findAsset(req.params.id);
 *     if (!asset) throw new ApiError(404, 'Không tìm thấy tài sản');
 *     res.json(asset);
 *   });
 */
class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true; // lỗi "dự kiến" (validation, not found...) khác với bug thật
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
