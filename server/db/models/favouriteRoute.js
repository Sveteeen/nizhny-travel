module.exports = (sequelize, DataTypes) => {
  const FavouriteRoute = sequelize.define(
    'FavouriteRoute',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      route_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: 'favourite_routes',
      timestamps: false,
    }
  );

  FavouriteRoute.associate = (models) => {
    FavouriteRoute.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });

    FavouriteRoute.belongsTo(models.Route, {
      foreignKey: 'route_id',
      as: 'route',
    });
  };

  return FavouriteRoute;
};
