module.exports = (sequelize, DataTypes) => {
  const Route = sequelize.define(
    'Route',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      main_photo: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      duration_minutes: {
        type: DataTypes.NUMERIC,
        allowNull: false,
      },
      distance_km: {
        type: DataTypes.NUMERIC,
        allowNull: false,
      },
    },
    {
      tableName: 'routes',
      timestamps: false,
    }
  );

  Route.associate = (models) => {
    Route.hasMany(models.RoutePlace, {
      foreignKey: 'route_id',
      as: 'route_places',
    });

    Route.hasMany(models.FavouriteRoute, {
      foreignKey: 'route_id',
      as: 'favourited_by',
    });
  };

  return Route;
};
