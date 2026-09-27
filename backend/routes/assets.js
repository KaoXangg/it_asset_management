const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { createAssetRules, updateAssetRules } = require('../middleware/validators/assetValidator');
const { uploadAssetImage } = require('../middleware/upload');

// All routes require authentication
router.use(authenticateToken);

router.get('/', assetController.getAllAssets);
router.get('/stats', assetController.getAssetStats);
router.get('/code/:code', assetController.getAssetByCode);
router.get('/:id', assetController.getAssetById);
router.post('/', authorizeRoles('admin', 'it_staff'), createAssetRules, assetController.createAsset);
router.put('/:id', authorizeRoles('admin', 'it_staff'), updateAssetRules, assetController.updateAsset);
router.post('/:id/qrcode', authorizeRoles('admin', 'it_staff'), assetController.regenerateQrCode);
router.post(
  '/:id/image',
  authorizeRoles('admin', 'it_staff'),
  uploadAssetImage.single('image'),
  assetController.uploadImage
);
router.delete('/:id', authorizeRoles('admin'), assetController.deleteAsset);

module.exports = router;

