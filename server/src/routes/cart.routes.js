const express = require('express');
const { protect } = require('../middlewares/auth.middleware');
const { getMyCart, replaceMyCart, clearMyCart } = require('../controllers/cart.controller');

const router = express.Router();

router.get('/my', protect, getMyCart);
router.put('/my', protect, replaceMyCart);
router.delete('/my', protect, clearMyCart);

module.exports = router;
