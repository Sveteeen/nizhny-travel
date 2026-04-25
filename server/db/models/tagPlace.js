module.exports = (sequelize, DataTypes) => {
  const TagPlace = sequelize.define(
    'TagPlace',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      tag_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      place_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: 'tags_places',
      timestamps: true,
    }
  );

  TagPlace.associate = (models) => {
    TagPlace.belongsTo(models.Tag, {
      foreignKey: 'tag_id',
      as: 'tag',
    });

    TagPlace.belongsTo(models.Place, {
      foreignKey: 'place_id',
      as: 'place',
    });
  };

  return TagPlace;
};
