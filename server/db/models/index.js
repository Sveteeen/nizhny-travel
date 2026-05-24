const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config.js');

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: false,
  }
);

//импортируем функцию создания модели и сразу ее создаем
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
const SavedRoute = require('./savedRoute')(sequelize, DataTypes);
const SavedRoutePlace = require('./savedRoutePlace')(sequelize, DataTypes);

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
  SavedRoute,
  SavedRoutePlace,
};

Object.values(db).forEach((model) => {
  if (model && typeof model.associate === 'function') {
    model.associate(db);
  }
});

module.exports = db;