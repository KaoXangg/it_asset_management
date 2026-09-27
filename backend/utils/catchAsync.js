/**
 * Bọc một async controller để tự động forward lỗi cho errorHandler,
 * thay vì phải viết try/catch ở mỗi hàm.
 *
 *   exports.getAssetById = catchAsync(async (req, res) => { ... });
 */
module.exports = function catchAsync(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
