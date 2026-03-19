const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI || '',
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@easycart.com',
  adminPassword: process.env.ADMIN_PASSWORD || 'Admin@123',
  adminName: process.env.ADMIN_NAME || 'Admin'
};

module.exports = env;
