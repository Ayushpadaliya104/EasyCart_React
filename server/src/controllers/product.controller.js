const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const slugify = require('../utils/slugify');

const getProducts = async (req, res, next) => {
  try {
    const {
      search = '',
      category,
      minPrice,
      maxPrice,
      sortBy = 'newest',
      page = 1,
      limit = 12
    } = req.query;

    const query = { isActive: true };

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        query.category = category;
      } else {
        const categoryDoc = await Category.findOne({ slug: category.toLowerCase() });
        if (categoryDoc) {
          query.category = categoryDoc._id;
        }
      }
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) {
        query.price.$gte = Number(minPrice);
      }
      if (maxPrice) {
        query.price.$lte = Number(maxPrice);
      }
    }

    const sortMap = {
      newest: { createdAt: -1 },
      priceAsc: { price: 1 },
      priceDesc: { price: -1 },
      rating: { rating: -1 }
    };

    const perPage = Math.max(1, Number(limit) || 12);
    const currentPage = Math.max(1, Number(page) || 1);
    const skip = (currentPage - 1) * perPage;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .sort(sortMap[sortBy] || sortMap.newest)
        .skip(skip)
        .limit(perPage),
      Product.countDocuments(query)
    ]);

    return res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: currentPage,
      totalPages: Math.ceil(total / perPage),
      products
    });
  } catch (error) {
    return next(error);
  }
};

const getProductByIdOrSlug = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;

    const query = mongoose.Types.ObjectId.isValid(idOrSlug)
      ? { _id: idOrSlug, isActive: true }
      : { slug: idOrSlug.toLowerCase(), isActive: true };

    const product = await Product.findOne(query).populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    return res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    return next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const {
      title,
      description,
      price,
      discountPrice,
      stock,
      images,
      category,
      brand,
      rating,
      isActive
    } = req.body;

    if (!title || price === undefined || !category) {
      return res.status(400).json({
        success: false,
        message: 'title, price and category are required'
      });
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category'
      });
    }

    const product = await Product.create({
      title,
      slug: slugify(title),
      description: description || '',
      price: Number(price),
      discountPrice: Number(discountPrice || 0),
      stock: Number(stock || 0),
      images: Array.isArray(images) ? images : [],
      category,
      brand: brand || '',
      rating: Number(rating || 0),
      isActive: typeof isActive === 'boolean' ? isActive : true
    });

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Product slug already exists. Use a different title.'
      });
    }
    return next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (updates.title) {
      updates.slug = slugify(updates.title);
    }

    if (updates.category) {
      const categoryExists = await Category.findById(updates.category);
      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category'
        });
      }
    }

    const updated = await Product.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    }).populate('category', 'name slug');

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product: updated
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Product slug already exists. Use a different title.'
      });
    }
    return next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getProducts,
  getProductByIdOrSlug,
  createProduct,
  updateProduct,
  deleteProduct
};
