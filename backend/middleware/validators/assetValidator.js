const { body, validationResult } = require('express-validator');

const ASSET_TYPES = ['laptop', 'desktop', 'monitor', 'printer', 'phone', 'tablet', 'other'];
const ASSET_STATUSES = ['available', 'in_use', 'maintenance', 'broken', 'disposed'];
const CONDITION_STATUSES = ['new', 'good', 'fair', 'poor'];

// Chạy sau các rule bên dưới — nếu có lỗi thì trả 400 với danh sách lỗi rõ ràng
// thay vì để controller tự validate rải rác hoặc để lỗi SQL mơ hồ văng ra.
function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Dữ liệu không hợp lệ',
      details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}

const createAssetRules = [
  body('asset_code')
    .trim()
    .notEmpty().withMessage('Mã tài sản không được để trống')
    .isLength({ max: 50 }).withMessage('Mã tài sản tối đa 50 ký tự'),
  body('name')
    .trim()
    .notEmpty().withMessage('Tên tài sản không được để trống')
    .isLength({ max: 200 }).withMessage('Tên tài sản tối đa 200 ký tự'),
  body('type')
    .notEmpty().withMessage('Loại tài sản không được để trống')
    .isIn(ASSET_TYPES).withMessage(`Loại tài sản phải là một trong: ${ASSET_TYPES.join(', ')}`),
  body('status')
    .optional({ values: 'falsy' })
    .isIn(ASSET_STATUSES).withMessage(`Trạng thái phải là một trong: ${ASSET_STATUSES.join(', ')}`),
  body('condition_status')
    .optional({ values: 'falsy' })
    .isIn(CONDITION_STATUSES).withMessage(`Tình trạng phải là một trong: ${CONDITION_STATUSES.join(', ')}`),
  body('purchase_price')
    .optional({ values: 'falsy' })
    .isFloat({ min: 0 }).withMessage('Giá mua phải là số không âm'),
  body('current_value')
    .optional({ values: 'falsy' })
    .isFloat({ min: 0 }).withMessage('Giá trị hiện tại phải là số không âm'),
  body('purchase_date')
    .optional({ values: 'falsy' })
    .isISO8601().withMessage('Ngày mua không hợp lệ'),
  body('warranty_expiry')
    .optional({ values: 'falsy' })
    .isISO8601().withMessage('Ngày hết bảo hành không hợp lệ'),
  handleValidation,
];

const updateAssetRules = [
  body('type')
    .optional({ values: 'falsy' })
    .isIn(ASSET_TYPES).withMessage(`Loại tài sản phải là một trong: ${ASSET_TYPES.join(', ')}`),
  body('status')
    .optional({ values: 'falsy' })
    .isIn(ASSET_STATUSES).withMessage(`Trạng thái phải là một trong: ${ASSET_STATUSES.join(', ')}`),
  body('condition_status')
    .optional({ values: 'falsy' })
    .isIn(CONDITION_STATUSES).withMessage(`Tình trạng phải là một trong: ${CONDITION_STATUSES.join(', ')}`),
  body('purchase_price')
    .optional({ values: 'falsy' })
    .isFloat({ min: 0 }).withMessage('Giá mua phải là số không âm'),
  body('current_value')
    .optional({ values: 'falsy' })
    .isFloat({ min: 0 }).withMessage('Giá trị hiện tại phải là số không âm'),
  handleValidation,
];

module.exports = { createAssetRules, updateAssetRules };
