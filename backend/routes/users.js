const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { updateUserRules } = require('../middleware/validators/userValidator');

router.use(authenticateToken);

router.get('/', authorizeRoles('admin', 'it_staff'), userController.getAllUsers);
router.get('/:id', authorizeRoles('admin', 'it_staff'), userController.getUserById);
router.put('/:id', authorizeRoles('admin'), updateUserRules, userController.updateUser);
router.delete('/:id', authorizeRoles('admin'), userController.deleteUser);

module.exports = router;

