const StoreSettings = require('../models/StoreSettings');

const DEFAULT_SETTINGS = {
  storeName: 'EasyCart',
  email: 'support@easycart.com',
  phone: '+91-90909-90909',
  address: '123 Business Ave, City, State 12345',
  taxRate: 8
};

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const buildResponse = (settingsDoc) => ({
  storeName: settingsDoc.storeName,
  email: settingsDoc.email,
  phone: settingsDoc.phone,
  address: settingsDoc.address,
  taxRate: Number(settingsDoc.taxRate || 0)
});

const getOrCreateSettings = async () => {
  let settings = await StoreSettings.findOne({ key: 'default' });

  if (!settings) {
    settings = await StoreSettings.create({
      key: 'default',
      ...DEFAULT_SETTINGS
    });
  }

  return settings;
};

const getPublicStoreSettings = async (_req, res, next) => {
  try {
    const settings = await getOrCreateSettings();

    return res.status(200).json({
      success: true,
      settings: buildResponse(settings)
    });
  } catch (error) {
    return next(error);
  }
};

const getAdminStoreSettings = async (_req, res, next) => {
  try {
    const settings = await getOrCreateSettings();

    return res.status(200).json({
      success: true,
      settings: buildResponse(settings)
    });
  } catch (error) {
    return next(error);
  }
};

const updateAdminStoreSettings = async (req, res, next) => {
  try {
    const {
      storeName = '',
      email = '',
      phone = '',
      address = '',
      taxRate
    } = req.body;

    if (!String(storeName).trim()) {
      return res.status(400).json({
        success: false,
        message: 'storeName is required'
      });
    }

    if (!String(email).trim() || !isValidEmail(String(email).trim())) {
      return res.status(400).json({
        success: false,
        message: 'Valid email is required'
      });
    }

    if (!String(phone).trim()) {
      return res.status(400).json({
        success: false,
        message: 'phone is required'
      });
    }

    if (!String(address).trim()) {
      return res.status(400).json({
        success: false,
        message: 'address is required'
      });
    }

    const parsedTaxRate = Number(taxRate);
    if (Number.isNaN(parsedTaxRate) || parsedTaxRate < 0 || parsedTaxRate > 100) {
      return res.status(400).json({
        success: false,
        message: 'taxRate must be between 0 and 100'
      });
    }

    const settings = await StoreSettings.findOneAndUpdate(
      { key: 'default' },
      {
        key: 'default',
        storeName: String(storeName).trim(),
        email: String(email).trim().toLowerCase(),
        phone: String(phone).trim(),
        address: String(address).trim(),
        taxRate: parsedTaxRate
      },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Store settings updated successfully',
      settings: buildResponse(settings)
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  DEFAULT_SETTINGS,
  getOrCreateSettings,
  getPublicStoreSettings,
  getAdminStoreSettings,
  updateAdminStoreSettings
};
