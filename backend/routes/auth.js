const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const rateLimit = require('../middleware/rateLimit');
const { loginRules, registerRules } = require('../middleware/validators/authValidator');

// Chống brute-force: tối đa 10 lần thử đăng nhập / phút / IP
const loginRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Bạn đăng nhập sai quá nhiều lần, vui lòng thử lại sau ít phút.',
});

router.post('/login', loginRateLimit, loginRules, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

// Trước đây route này không yêu cầu đăng nhập — bất kỳ ai cũng có thể tự tạo tài
// khoản admin. Giờ chỉ admin đã đăng nhập mới được tạo user mới.
router.post(
  '/register',
  authenticateToken,
  authorizeRoles('admin'),
  registerRules,
  authController.register
);

router.get('/profile', authenticateToken, authController.getProfile);

module.exports = router;
