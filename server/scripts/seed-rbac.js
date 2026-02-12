/**
 * Seed RBAC tables: MASTER_USER_ROLE, MASTER_PAGE_LIST, ROLE_PAGE_ACCESS
 * Run: node scripts/seed-rbac.js
 */
require('dotenv').config();
const config = require('../app.config');

global.config = {
  clientHost: config.clientHost,
  serverHost: config.serverHost,
  database: {
    host: config.database.host,
    dialect: config.database.dialect,
    port: config.database.port,
    logging: config.database.logging,
    hh: {
      db: config.database.serviceAPI.db,
      user: config.database.serviceAPI.name,
      name: config.database.serviceAPI.name,
      password: config.database.serviceAPI.password,
    },
  },
  email: config.email,
};

const db = require('../models');

const pages = [
  { pageName: 'Dashboard', pageURL: '/dashboard' },
  { pageName: 'Complaints', pageURL: '/complaints' },
  { pageName: 'Admission List', pageURL: '/admission/admission-list' },
  { pageName: 'Admission Confirmation', pageURL: '/admission/admission-confirmation' },
  { pageName: 'Admission Transfer', pageURL: '/admission/admission-transfer' },
  { pageName: 'Candidate Payments', pageURL: '/admission/candidate-payments' },
  { pageName: 'EB Charges', pageURL: '/admission/eb-charges' },
  { pageName: 'Branch', pageURL: '/branch' },
  { pageName: 'Feedback', pageURL: '/feedback' },
  { pageName: 'Vacate', pageURL: '/vacate' },
  { pageName: 'Blacklist', pageURL: '/blacklist' },
  { pageName: 'Announcements', pageURL: '/announcements' },
  { pageName: 'Attendance', pageURL: '/attendance' },
  { pageName: 'Amenities Category', pageURL: '/master/amenities-category' },
  { pageName: 'Amenities Sub Category', pageURL: '/master/amenities-sub-category' },
  { pageName: 'Amenities Facilities', pageURL: '/master/amenities-facilities' },
  { pageName: 'Room Type', pageURL: '/master/room-type' },
  { pageName: 'Bathroom Type', pageURL: '/master/bathroom-type' },
  { pageName: 'Cot Type', pageURL: '/master/cot-type' },
  { pageName: 'Issue Category', pageURL: '/master/issue-category' },
  { pageName: 'Issue Sub Category', pageURL: '/master/issue-sub-category' },
  { pageName: 'Page List', pageURL: '/master/page-list' },
  { pageName: 'Sharing Type', pageURL: '/master/sharing-type' },
  { pageName: 'User Role', pageURL: '/master/user-role' },
  { pageName: 'Service Provider Category', pageURL: '/master/service-provider-category' },
  { pageName: 'Bulk Upload', pageURL: '/master/bulk-upload' },
  { pageName: 'User Page Access', pageURL: '/user/user-page-access' },
  { pageName: 'User List', pageURL: '/user/user-list' },
  { pageName: 'Service Provider', pageURL: '/user/service-provider' },
  { pageName: 'Payment Status', pageURL: '/payment-status' },
];

async function seed() {
  try {
    await db.sequelize.authenticate();
    console.log('DB connected.');

    await db.sequelize.sync();
    console.log('Tables synced.');

    // 1. Seed Super Admin role
    const [role] = await db.MasterUserRoles.findOrCreate({
      where: { roleName: 'Super Admin' },
      defaults: { roleName: 'Super Admin', isActive: true },
    });
    console.log(`Role: ${role.roleName} (id=${role.id})`);

    // 2. Seed all pages
    for (const page of pages) {
      await db.MasterPageList.findOrCreate({
        where: { pageURL: page.pageURL },
        defaults: { ...page, isActive: true },
      });
    }
    const allPages = await db.MasterPageList.findAll();
    console.log(`Pages seeded: ${allPages.length}`);

    // 3. Seed ROLE_PAGE_ACCESS - Super Admin gets Full access to everything
    for (const page of allPages) {
      await db.RolePageAccess.findOrCreate({
        where: { roleId: role.id, pageId: page.id },
        defaults: {
          roleId: role.id,
          pageId: page.id,
          accessLevel: 'Full',
          isActive: true,
        },
      });
    }
    console.log(`Role-page access seeded for Super Admin.`);

    // 4. Ensure at least one admin user exists with this role
    const existingUsers = await db.Users.findAll();
    if (existingUsers.length === 0) {
      await db.Users.create({
        firstName: 'Admin',
        lastName: 'User',
        emailAddress: 'admin@hostelhost.com',
        mobileNumber: '9999999999',
        userRoleId: role.id,
        isActive: true,
        emailVerifiedAt: new Date(),
        mobileVerifiedAt: new Date(),
      });
      console.log('Created default admin user: admin@hostelhost.com / 9999999999');
    } else {
      // Update existing users to have Super Admin role if they don't have one
      const usersWithoutRole = await db.Users.findAll({ where: { userRoleId: null } });
      for (const u of usersWithoutRole) {
        await u.update({ userRoleId: role.id });
        console.log(`Updated user ${u.emailAddress || u.mobileNumber} with Super Admin role.`);
      }
      // Also ensure all existing users have the role
      for (const u of existingUsers) {
        if (!u.userRoleId) {
          await u.update({ userRoleId: role.id });
        }
      }
      console.log(`Existing users: ${existingUsers.length}`);
    }

    console.log('\nDone! You can now log in and should see all buttons.');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
