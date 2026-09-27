const { body, validationResult } = require('express-validator');

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

const createAssignmentRules = [
  body('asset_id').notEmpty().withMessage('Vui lòng chọn tài sản').isInt().withMessage('asset_id không hợp lệ'),
  body('user_id').notEmpty().withMessage('Vui lòng chọn người dùng').isInt().withMessage('user_id không hợp lệ'),
  body('assigned_date').notEmpty().withMessage('Vui lòng chọn ngày phân bổ').isISO8601().withMessage('Ngày phân bổ không hợp lệ'),
  handleValidation,
];

const returnAssetRules = [
  body('return_date').notEmpty().withMessage('Vui lòng chọn ngày trả').isISO8601().withMessage('Ngày trả không hợp lệ'),
  handleValidation,
];

module.exports = { createAssignmentRules, returnAssetRules };
