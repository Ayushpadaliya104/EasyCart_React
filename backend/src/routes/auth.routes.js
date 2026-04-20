const express = require('express');

const {
  register,
  login,
  getMe,
  updateMe,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyResetToken
} = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.get('/verify-reset-token', verifyResetToken);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.post('/change-password', protect, changePassword);

module.exports = router;
