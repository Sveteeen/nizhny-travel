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

const Role = require('./role')(sequelize, DataTypes);
const User = require('./user')(sequelize, DataTypes);
const Category = require('./category')(sequelize, DataTypes);
const Place = require('./place')(sequelize, DataTypes);
const Route = require('./route')(sequelize, DataTypes);
const RoutePlace = require('./routePlace')(sequelize, DataTypes);
const FavouritePlace = require('./favouritePlace')(sequelize, DataTypes);
const PlacePhoto = require('./placePhoto')(sequelize, DataTypes);
const FavouriteRoute = require('./favouriteRoute')(sequelize, DataTypes);
const Tag = require('./tag')(sequelize, DataTypes);
const TagPlace = require('./tagPlace')(sequelize, DataTypes);

const db = {
  sequelize,
  Sequelize,
  Role,
  User,
  Category,
  Place,
  Route,
  RoutePlace,
  FavouritePlace,
  PlacePhoto,
  FavouriteRoute,
  Tag,
  TagPlace,
};

Object.values(db).forEach((model) => {
  if (model && typeof model.associate === 'function') {
    model.associate(db);
  }
});

module.exports = db;