const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const SHIPPING_ADDRESS_FIELDS = [
  'firstName',
  'lastName',
  'email',
  'phone',
  'address',
  'city',
  'state',
  'zipcode'
];

const toSafeString = (value) => String(value ?? '').trim();

const sanitizeDefaultShippingAddress = (source = {}, fallbackEmail = '') => {
  const shippingAddress = {
    firstName: toSafeString(source.firstName),
    lastName: toSafeString(source.lastName),
    email: toSafeString(source.email || fallbackEmail).toLowerCase(),
    phone: toSafeString(source.phone),
    address: toSafeString(source.address),
    city: toSafeString(source.city),
    state: toSafeString(source.state),
    zipcode: toSafeString(source.zipcode)
  };

  return shippingAddress;
};

const sanitizeUser = (userDoc) => {
  const shippingAddress = sanitizeDefaultShippingAddress(
    userDoc.defaultShippingAddress || {},
    userDoc.email
  );

  return {
    id: userDoc._id,
    name: userDoc.name,
    email: userDoc.email,
    role: userDoc.role,
    phone: userDoc.phone || shippingAddress.phone || '',
    address: userDoc.address || shippingAddress.address || '',
    defaultShippingAddress: shippingAddress,
    createdAt: userDoc.createdAt,
    updatedAt: userDoc.updatedAt
  };
};

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'name, email and password are required'
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'user'
    });

    const token = generateToken({ id: user._id, role: user.role });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'email and password are required'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = generateToken({ id: user._id, role: user.role });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    return next(error);
  }
};

const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: sanitizeUser(req.user)
  });
};

const updateMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { name, email, phone, defaultShippingAddress } = req.body;

    if (name !== undefined) {
      const normalizedName = toSafeString(name);

      if (normalizedName.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Name must be at least 2 characters'
        });
      }

      user.name = normalizedName;
    }

    if (email !== undefined) {
      const normalizedEmail = toSafeString(email).toLowerCase();

      if (!isValidEmail(normalizedEmail)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
      }

      const existingUser = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: user._id }
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Email already exists'
        });
      }

      user.email = normalizedEmail;
    }

    if (phone !== undefined) {
      user.phone = toSafeString(phone);
    }

    if (defaultShippingAddress !== undefined) {
      if (typeof defaultShippingAddress !== 'object' || Array.isArray(defaultShippingAddress)) {
        return res.status(400).json({
          success: false,
          message: 'defaultShippingAddress must be an object'
        });
      }

      const normalizedShippingAddress = sanitizeDefaultShippingAddress(
        defaultShippingAddress,
        user.email
      );

      const hasMissingField = SHIPPING_ADDRESS_FIELDS.some(
        (field) => !normalizedShippingAddress[field]
      );

      if (hasMissingField) {
        return res.status(400).json({
          success: false,
          message: 'Complete defaultShippingAddress is required'
        });
      }

      user.defaultShippingAddress = normalizedShippingAddress;
      user.phone = normalizedShippingAddress.phone;
      user.address = normalizedShippingAddress.address;
    } else if (email !== undefined && user.defaultShippingAddress?.email) {
      user.defaultShippingAddress.email = user.email;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: sanitizeUser(user)
    });
  } catch (error) {
    return next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Old password and new password are required'
      });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isPasswordMatched = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordMatched) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    if (oldPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password'
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateMe,
  changePassword
};
