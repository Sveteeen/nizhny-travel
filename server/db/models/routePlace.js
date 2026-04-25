module.exports = (sequelize, DataTypes) => {
  const RoutePlace = sequelize.define(
    'RoutePlace',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      route_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      place_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      order_index: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: 'routes_places',
      timestamps: true,
    }
  );

  RoutePlace.associate = (models) => {
    RoutePlace.belongsTo(models.Route, {
      foreignKey: 'route_id',
      as: 'route',
    });

    RoutePlace.belongsTo(models.Place, {
      foreignKey: 'place_id',
      as: 'place',
    });
  };

  return RoutePlace;
};
