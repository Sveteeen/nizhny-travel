module.exports = (sequelize, DataTypes) => {
  const SavedRoutePlace = sequelize.define(
    'SavedRoutePlace',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      saved_route_id: {
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
      leg_duration_minutes: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      leg_distance_km: {
        type: DataTypes.NUMERIC,
        allowNull: true,
      },
    },
    {
      tableName: 'saved_route_places',
      timestamps: true,
    }
  );

  SavedRoutePlace.associate = (models) => {
    SavedRoutePlace.belongsTo(models.SavedRoute, {
      foreignKey: 'saved_route_id',
      as: 'saved_route',
    });

    SavedRoutePlace.belongsTo(models.Place, {
      foreignKey: 'place_id',
      as: 'place',
    });
  };

  return SavedRoutePlace;
};
