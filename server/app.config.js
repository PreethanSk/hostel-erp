require('dotenv').config();

module.exports = {
  clientHost: process.env.REACT_HOST,
  serverHost: process.env.API_HOST,
  serverPort: process.env.PORT,
  database: {
    host: process.env.DATABASE_HOST,
    dialect: process.env.DATABASE_DIALECT,
    port: process.env.DATABASE_PORT,
    logging: process.env.DATABASE_LOGGING === 'true', // Convert string to boolean
    serviceAPI: {
      db: process.env.DATABASE_SERVICE_API_DB,
      user: process.env.DATABASE_SERVICE_API_NAME,
      name: process.env.DATABASE_SERVICE_API_NAME,
      password: process.env.DATABASE_SERVICE_API_PASSWORD,
    },
  },
  email: {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
};
