require('dotenv').config();
const mongoose = require('mongoose');
const { User } = require('../src/models/user.model');
const config = require('../src/config/config');

const {
  server: { mongoHost, mongoPort, db, poolSize, MONGODB_URI },
} = config;

const MONGO_URI =
  MONGODB_URI || `mongodb://${mongoHost}:${mongoPort}/${db}?maxPoolSize=${poolSize}`;

async function createAdminUser() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(' Connected to MongoDB');

    const adminUser = new User({
      name: 'Admin',
      email: 'admin@gmail.com',
      password: 'password',
      role: 'ADMIN',
      isEmailVerified: true,
      isActive: true,
    });

    await adminUser.save();

    console.log('Admin user created successfully!');
    console.log('-----------------------------');
    console.log(`Email: ${adminUser.email}`);
    console.log(`Password: password`);
    console.log(`Role: ${adminUser.role}`);
    console.log('-----------------------------');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();
