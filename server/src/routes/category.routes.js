const express = require('express');

const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/category.controller');
const { protect, requireAdmin } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', getCategories);
router.post('/', protect, requireAdmin, createCategory);
router.put('/:id', protect, requireAdmin, updateCategory);
router.delete('/:id', protect, requireAdmin, deleteCategory);

module.exports = router;
