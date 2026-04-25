module.exports = (sequelize, DataTypes) => {
  const FavouritePlace = sequelize.define(
    'FavouritePlace',
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
      place_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: 'favourite_places',
      timestamps: true,
    }
  );

  FavouritePlace.associate = (models) => {
    FavouritePlace.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });

    FavouritePlace.belongsTo(models.Place, {
      foreignKey: 'place_id',
      as: 'place',
    });
  };

  return FavouritePlace;
};
