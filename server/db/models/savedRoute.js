module.exports = (sequelize, DataTypes) => {
  const SavedRoute = sequelize.define(
    'SavedRoute',
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
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      distance_km: {
        type: DataTypes.NUMERIC,
        allowNull: false,
      },
      duration_minutes: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      route_geometry: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      start_place_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: 'saved_routes',
      timestamps: true,
    }
  );

  SavedRoute.associate = (models) => {
    SavedRoute.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });

    SavedRoute.belongsTo(models.Place, {
      foreignKey: 'start_place_id',
      as: 'start_place',
    });

    SavedRoute.hasMany(models.SavedRoutePlace, {
      foreignKey: 'saved_route_id',
      as: 'route_places',
    });
  };

  return SavedRoute;
};
