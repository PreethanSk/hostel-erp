const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const logger = require('morgan');
const cors = require('cors');
const responseTime = require('response-time');
const config = require('./app.config');

global.config = {
  clientHost: config.clientHost,
  serverHost: config.serverHost,
  database: {
    host: config.database.host,
    dialect: config.database.dialect,
    port: config.database.port,
    logging: config.database.logging,
    serviceApi: {
      db: config.database.serviceAPI.db,
      user: config.database.serviceAPI.name,
      name: config.database.serviceAPI.name,
      password: config.database.serviceAPI.password
    }
  },
  email: {
    host: config.email.host,
    port: config.email.port,
    secure: config.email.secure,
    user: config.email.user,
    pass: config.email.pass,
  },
  debugger: true
};

const app = express();
app.use(responseTime());
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.get('/termsandconditions', (_, res) => {
  res.sendFile(path.join(__dirname, 'public', 'termsAndCondition.html'));
});
app.get('/policy', (_, res) => {
  res.sendFile(path.join(__dirname, 'public', 'privacyPolicy.html'));
});
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/user', express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const db = require('./models');

const initializeDatabase = async (retries = 5, delay = 5000) => {
  let attempt = 0;

  while (attempt < retries) {
    try {
      console.log(`Attempting DB connection (try ${attempt + 1}/${retries})...`);
      await db.sequelize.authenticate();
      console.log('Database connection established successfully.');
      await db.sequelize.sync();
      console.log('Database sync success.');
      break;
    } catch (error) {
      console.error(`DB connection failed (attempt ${attempt + 1}):`, error.message);
      attempt++;
      if (attempt >= retries) {
        console.error('Max retries reached. DB not connected.');
        break;
      }
      console.log(`Retrying in ${delay / 1000} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

initializeDatabase();

db.sequelize.addHook('afterConnect', (connection) => {
  connection.on('error', (err) => {
    console.error('Database connection error:', err);
    if (err.code === 'ECONNRESET') {
      console.log('Connection reset, attempting to reconnect...');
    }
  });
});

require('./routes/index')(app);
require('./paymentGateway/index')(app);
require('./crons/dailyJob');

app.use((error, req, res, next) => {
  console.log('Error Handling Middleware called');
  console.error('Error: ', error);
  res.status(400).json(error);
  next(error);
});

app.listen(config.serverPort, () => {
  console.log(`Server started on port ${config.serverPort}`);
});

module.exports = app;
