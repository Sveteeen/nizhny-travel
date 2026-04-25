module.exports = (sequelize, DataTypes) => {
  const Place = sequelize.define(
    'Place',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      latitude: {
        type: DataTypes.DECIMAL,
        allowNull: false,
      },
      longitude: {
        type: DataTypes.DECIMAL,
        allowNull: false,
      },
      main_photo: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      tableName: 'places',
      timestamps: false,
    }
  );

  Place.associate = (models) => {
    Place.belongsTo(models.Category, {
      foreignKey: 'category_id',
      as: 'category',
    });

    Place.hasMany(models.RoutePlace, {
      foreignKey: 'place_id',
      as: 'route_points',
    });

    Place.hasMany(models.FavouritePlace, {
      foreignKey: 'place_id',
      as: 'favourited_by',
    });

    Place.hasMany(models.PlacePhoto, {
      foreignKey: 'place_id',
      as: 'photos',
    });

    Place.hasMany(models.TagPlace, {
      foreignKey: 'place_id',
      as: 'tag_links',
    });
  };

  return Place;
};
