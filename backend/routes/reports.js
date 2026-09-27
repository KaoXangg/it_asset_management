const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/activity-logs', authorizeRoles('admin', 'it_staff'), reportController.getActivityLogs);
router.get('/export/assets', authorizeRoles('admin', 'it_staff'), reportController.exportAssetsToExcel);
router.get('/export/assignments', authorizeRoles('admin', 'it_staff'), reportController.exportAssignmentsToExcel);
router.get('/export/maintenance', authorizeRoles('admin', 'it_staff'), reportController.exportMaintenanceToExcel);
router.get('/export/dashboard-pdf', authorizeRoles('admin', 'it_staff'), reportController.exportDashboardPDF);
router.get('/due-maintenance', authorizeRoles('admin', 'it_staff'), reportController.getDueMaintenanceAssets);
router.get('/maintenance-cost', authorizeRoles('admin', 'it_staff'), reportController.getMaintenanceCostReport);
router.get('/dashboard', reportController.getDashboardStats);
router.post('/notify-test', authorizeRoles('admin'), reportController.sendTestNotification);

module.exports = router;

