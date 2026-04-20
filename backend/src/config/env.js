const path = require('path');
const dotenv = require('dotenv');

// Always load env from backend/.env regardless of where the node process is started.
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI || '',
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || '',
  razorpayMockMode: String(process.env.RAZORPAY_MOCK_MODE || 'false').toLowerCase() === 'true',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@easycart.com',
  adminPassword: process.env.ADMIN_PASSWORD || 'Admin@123',
  adminName: process.env.ADMIN_NAME || 'Admin',
  smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
  smtpPort: Number(process.env.SMTP_PORT) || 587,
  smtpSecure: String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true',
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  smtpFrom: process.env.SMTP_FROM || 'noreply@easycart.com',
  passwordResetTokenExpiry: Number(process.env.PASSWORD_RESET_TOKEN_EXPIRY) || 15 // minutes
};

module.exports = env;
