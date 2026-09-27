const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { createMaintenanceRules, updateMaintenanceRules } = require('../middleware/validators/maintenanceValidator');

router.use(authenticateToken);

router.get('/', maintenanceController.getAllMaintenance);
router.get('/:id', maintenanceController.getMaintenanceById);
router.post('/', authorizeRoles('admin', 'it_staff'), createMaintenanceRules, maintenanceController.createMaintenance);
router.put('/:id', authorizeRoles('admin', 'it_staff'), updateMaintenanceRules, maintenanceController.updateMaintenance);

module.exports = router;
