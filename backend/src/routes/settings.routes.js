const express = require('express');
const {
  getPublicStoreSettings,
  getAdminStoreSettings,
  updateAdminStoreSettings
} = require('../controllers/settings.controller');
const { protect, requireAdmin } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', getPublicStoreSettings);
router.get('/admin', protect, requireAdmin, getAdminStoreSettings);
router.put('/admin', protect, requireAdmin, updateAdminStoreSettings);

module.exports = router;
