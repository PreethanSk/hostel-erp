/**
 * Seed a single admin user for login.
 * Run from server folder: node scripts/seed-admin-user.js
 *
 * Login email: preethan.sk@gmail.com
 * Default password: preethansk
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
const config = require('../app.config');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

global.config = {
  clientHost: config.clientHost,
  serverHost: config.serverHost,
  database: {
    host: config.database.host,
    dialect: config.database.dialect,
    port: config.database.port,
    logging: false,
    serviceApi: {
      db: config.database.serviceAPI.db,
      user: config.database.serviceAPI.name,
      name: config.database.serviceAPI.name,
      password: config.database.serviceAPI.password
    }
  },
  email: config.email,
  debugger: false
};

const db = require('../models');
const { DataTypes } = require('sequelize');

const EMAIL = 'preethan.sk@gmail.com';
const DEFAULT_PASSWORD = 'preethansk';

async function ensureUserColumns() {
  const qi = db.sequelize.getQueryInterface();
  const tableDesc = await qi.describeTable('Users');
  if (!tableDesc.keyPassword) {
    await qi.addColumn('Users', 'keyPassword', { type: DataTypes.STRING(255), allowNull: true });
    console.log('Added column Users.keyPassword');
  }
  if (!tableDesc.uniqueId) {
    await qi.addColumn('Users', 'uniqueId', { type: DataTypes.STRING(100), allowNull: true, unique: true });
    console.log('Added column Users.uniqueId');
  }
}

async function seed() {
  try {
    await db.sequelize.authenticate();
    await ensureUserColumns();

    const existing = await db.Users.findOne({ where: { emailAddress: EMAIL } });
    const keyPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    const now = moment().format('YYYY-MM-DD HH:mm:ss');

    if (existing) {
      await db.Users.update(
        { keyPassword, emailVerifiedAt: now, mobileVerifiedAt: now, isActive: true },
        { where: { id: existing.id } }
      );
      console.log('Admin user password updated.');
      console.log('  Email:', EMAIL);
      console.log('  Password:', DEFAULT_PASSWORD);
      process.exit(0);
      return;
    }

    let roleId = null;
    const role = await db.MasterUserRoles.findOne({ where: { roleName: 'Admin' } });
    if (role) {
      roleId = role.id;
    }

    await db.Users.create({
      userRoleId: roleId,
      branchId: null,
      uniqueId: uuidv4().replace(/-/g, ''),
      firstName: 'Preethan',
      lastName: 'SK',
      emailAddress: EMAIL,
      mobileNumber: null,
      keyPassword,
      emailVerifiedAt: now,
      mobileVerifiedAt: now,
      isActive: true,
      activatedAt: now
    });

    console.log('Admin user created successfully.');
    console.log('  Email:', EMAIL);
    console.log('  Password:', DEFAULT_PASSWORD);
    console.log('You can login with the above credentials.');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    if (err.message && err.message.includes('keyPassword')) {
      console.error('Ensure Users table has keyPassword and uniqueId columns. Start the server once so Sequelize can sync the model.');
    }
    process.exit(1);
  }
}

seed();
