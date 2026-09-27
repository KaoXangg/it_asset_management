const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { createAssignmentRules, returnAssetRules } = require('../middleware/validators/assignmentValidator');

router.use(authenticateToken);

router.get('/', assignmentController.getAllAssignments);
router.get('/my-assignments', assignmentController.getMyAssignments);
router.post('/', authorizeRoles('admin', 'it_staff'), createAssignmentRules, assignmentController.createAssignment);
router.put('/:id/return', authorizeRoles('admin', 'it_staff'), returnAssetRules, assignmentController.returnAsset);

module.exports = router;
