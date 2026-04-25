module.exports = (sequelize, DataTypes) => {
  const Tag = sequelize.define(
    'Tag',
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
    },
    {
      tableName: 'tags',
      timestamps: true,
    }
  );

  Tag.associate = (models) => {
    Tag.hasMany(models.TagPlace, {
      foreignKey: 'tag_id',
      as: 'place_links',
    });
  };

  return Tag;
};
