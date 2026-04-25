module.exports = (sequelize, DataTypes) => {
  const PlacePhoto = sequelize.define(
    'PlacePhoto',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      place_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      photo: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: 'places_photos',
      timestamps: false,
    }
  );

  PlacePhoto.associate = (models) => {
    PlacePhoto.belongsTo(models.Place, {
      foreignKey: 'place_id',
      as: 'place',
    });
  };

  return PlacePhoto;
};
