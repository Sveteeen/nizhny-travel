const { Sequelize, DataTypes } = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config.js');

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: env === 'development' ? console.log : false,
  }
);

// Потом: подключать модели отдельными файлами
// const User = require('./user')(sequelize, DataTypes);

const db = {
  sequelize,
  Sequelize,
  // User,
};

module.exports = db;