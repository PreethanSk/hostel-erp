/**
 * Seed MASTER_COUNTRY and MASTER_STATE with India, USA, UAE, Australia, UK and their states.
 * Run: node scripts/seed-countries-states.js
 */
require('dotenv').config();
const path = require('path');
const fs = require('fs');
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

const seedDataPath = path.join(__dirname, '../json/seed-countries-states.json');
const seedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf8'));

async function run() {
  try {
    await db.sequelize.authenticate();
    console.log('Database connected.');

    for (const countryRow of seedData.countries) {
      const [country] = await db.MasterCountry.findOrCreate({
        where: { name: countryRow.name },
        defaults: {
          name: countryRow.name,
          sortname: countryRow.sortname,
          phoneCode: countryRow.phoneCode,
          isActive: true,
        },
      });
      const countryId = country.id;
      console.log(`Country: ${country.name} (id: ${countryId})`);

      const stateNames = seedData.statesByCountry[countryRow.name];
      if (!stateNames || !stateNames.length) {
        console.log(`  No states defined.`);
        continue;
      }

      for (const stateName of stateNames) {
        await db.MasterState.findOrCreate({
          where: { name: stateName, country_id: countryId },
          defaults: {
            name: stateName,
            country_id: countryId,
            isActive: true,
          },
        });
      }
      console.log(`  States: ${stateNames.length} (ensured).`);
    }

    console.log('Seed completed.');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

run();
