const express = require('express');

const {
  getProducts,
  getProductByIdOrSlug,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/product.controller');
const { protect, requireAdmin } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', getProducts);
router.get('/:idOrSlug', getProductByIdOrSlug);
router.post('/', protect, requireAdmin, createProduct);
router.put('/:id', protect, requireAdmin, updateProduct);
router.delete('/:id', protect, requireAdmin, deleteProduct);

module.exports = router;
