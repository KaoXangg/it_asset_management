const { body, validationResult } = require('express-validator');

const ROLES = ['admin', 'it_staff', 'regular_user'];

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

const loginRules = [
  body('username').trim().notEmpty().withMessage('Username không được để trống'),
  body('password').notEmpty().withMessage('Password không được để trống'),
  handleValidation,
];

const registerRules = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username không được để trống')
    .isLength({ min: 3, max: 50 }).withMessage('Username phải từ 3-50 ký tự')
    .matches(/^[a-zA-Z0-9._-]+$/).withMessage('Username chỉ được chứa chữ, số, dấu chấm/gạch dưới/gạch ngang'),
  body('password')
    .isLength({ min: 6 }).withMessage('Password phải tối thiểu 6 ký tự'),
  body('full_name').trim().notEmpty().withMessage('Họ tên không được để trống'),
  body('email').optional({ values: 'falsy' }).isEmail().withMessage('Email không hợp lệ'),
  body('role').isIn(ROLES).withMessage(`Vai trò phải là một trong: ${ROLES.join(', ')}`),
  handleValidation,
];

module.exports = { loginRules, registerRules };
