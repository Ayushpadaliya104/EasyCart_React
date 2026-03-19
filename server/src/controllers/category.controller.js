const Category = require('../models/Category');
const slugify = require('../utils/slugify');

const getCategories = async (_req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: categories.length,
      categories
    });
  } catch (error) {
    return next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name, description, isActive } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'name is required'
      });
    }

    const slug = slugify(name);
    const existing = await Category.findOne({ slug });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Category already exists'
      });
    }

    const category = await Category.create({
      name,
      slug,
      description: description || '',
      isActive: typeof isActive === 'boolean' ? isActive : true
    });

    return res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    return next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    if (name) {
      category.name = name;
      category.slug = slugify(name);
    }
    if (typeof description === 'string') {
      category.description = description;
    }
    if (typeof isActive === 'boolean') {
      category.isActive = isActive;
    }

    await category.save();

    return res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      category
    });
  } catch (error) {
    return next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
