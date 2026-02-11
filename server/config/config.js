const config = require('../app.config');
module.exports = {
  "development": {
    "username": config.database.serviceAPI.user,
    "password": config.database.serviceAPI.password,
    "database": config.database.serviceAPI.db,
    "host": config.database.host,
    "dialect": config.database.dialect,
    "port": config.database.port
  },
  "test": {
    "username": config.database.serviceAPI.user,
    "password": config.database.serviceAPI.password,
    "database": config.database.serviceAPI.db,
    "host": config.database.host,
    "dialect": config.database.dialect,
    "port": config.database.port
  },
  "production": {
    "username": config.database.serviceAPI.user,
    "password": config.database.serviceAPI.password,
    "database": config.database.serviceAPI.db,
    "host": config.database.host,
    "dialect": config.database.dialect,
    "port": config.database.port
  }
};
