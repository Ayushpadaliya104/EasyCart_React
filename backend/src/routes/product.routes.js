const express = require('express');

const {
  getProducts,
  getTrendingProducts,
  getProductByIdOrSlug,
  getProductFeedback,
  upsertProductRating,
  createProductReview,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/product.controller');
const { protect, requireAdmin, optionalProtect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', getProducts);
router.get('/trending', getTrendingProducts);
router.get('/:idOrSlug/feedback', optionalProtect, getProductFeedback);
router.post('/:idOrSlug/rating', protect, upsertProductRating);
router.post('/:idOrSlug/reviews', protect, createProductReview);
router.get('/:idOrSlug', getProductByIdOrSlug);
router.post('/', protect, requireAdmin, createProduct);
router.put('/:id', protect, requireAdmin, updateProduct);
router.delete('/:id', protect, requireAdmin, deleteProduct);

module.exports = router;
