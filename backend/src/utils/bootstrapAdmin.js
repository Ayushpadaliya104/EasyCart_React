const bcrypt = require('bcryptjs');
const User = require('../models/User');

const bootstrapAdmin = async (env) => {
  const adminEmail = String(env.adminEmail || '').trim().toLowerCase();
  const adminPassword = String(env.adminPassword || '').trim();
  const adminName = String(env.adminName || 'Admin').trim();

  if (!adminEmail || !adminPassword) {
    return;
  }

  const existingAdmin = await User.findOne({ email: adminEmail });
  if (existingAdmin) {
    if (existingAdmin.role !== 'admin') {
      existingAdmin.role = 'admin';
      await existingAdmin.save();
    }
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  await User.create({
    name: adminName,
    email: adminEmail,
    password: hashedPassword,
    role: 'admin'
  });

  console.log('Default admin user created');
};

module.exports = bootstrapAdmin;
