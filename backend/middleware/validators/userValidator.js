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

const updateUserRules = [
  body('full_name').optional({ values: 'falsy' }).trim().notEmpty().withMessage('Họ tên không được để trống'),
  body('email').optional({ values: 'falsy' }).isEmail().withMessage('Email không hợp lệ'),
  body('role').optional({ values: 'falsy' }).isIn(ROLES).withMessage(`Vai trò phải là một trong: ${ROLES.join(', ')}`),
  body('password').optional({ values: 'falsy' }).isLength({ min: 6 }).withMessage('Password phải tối thiểu 6 ký tự'),
  handleValidation,
];

module.exports = { updateUserRules };
