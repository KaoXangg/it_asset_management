const { body, validationResult } = require('express-validator');

const MAINTENANCE_TYPES = ['repair', 'inspection', 'upgrade', 'cleaning', 'other'];
const MAINTENANCE_STATUSES = ['pending', 'in_progress', 'completed', 'cancelled'];

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

const createMaintenanceRules = [
  body('asset_id').notEmpty().withMessage('Vui lòng chọn tài sản').isInt().withMessage('asset_id không hợp lệ'),
  body('maintenance_type').isIn(MAINTENANCE_TYPES).withMessage(`Loại bảo trì phải là một trong: ${MAINTENANCE_TYPES.join(', ')}`),
  body('description').trim().notEmpty().withMessage('Mô tả không được để trống'),
  body('maintenance_date').notEmpty().withMessage('Vui lòng chọn ngày bảo trì').isISO8601().withMessage('Ngày bảo trì không hợp lệ'),
  body('cost').optional({ values: 'falsy' }).isFloat({ min: 0 }).withMessage('Chi phí phải là số không âm'),
  body('status').optional({ values: 'falsy' }).isIn(MAINTENANCE_STATUSES).withMessage(`Trạng thái phải là một trong: ${MAINTENANCE_STATUSES.join(', ')}`),
  handleValidation,
];

const updateMaintenanceRules = [
  body('status').optional({ values: 'falsy' }).isIn(MAINTENANCE_STATUSES).withMessage(`Trạng thái phải là một trong: ${MAINTENANCE_STATUSES.join(', ')}`),
  body('cost').optional({ values: 'falsy' }).isFloat({ min: 0 }).withMessage('Chi phí phải là số không âm'),
  handleValidation,
];

module.exports = { createMaintenanceRules, updateMaintenanceRules };
