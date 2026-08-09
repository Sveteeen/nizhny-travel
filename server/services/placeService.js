const { Op } = require('sequelize');
const { Place, Category, PlacePhoto, TagPlace, Tag } = require('../db/models');

const parseIds = (value) => {
  if (value == null || value === '') return [];
  const raw = Array.isArray(value) ? value : String(value).split(',');
  return [...new Set(raw.map(Number).filter((id) => Number.isInteger(id) && id > 0))];
};

const getAllPlaces = async (filter = {}) => {
  const { search, category, tag } = filter;
  const whereParams = {};
  const categoryIds = parseIds(category);
  const tagIds = parseIds(tag);

  if (search) {
    const pattern = `%${search.trim()}%`;
    whereParams[Op.or] = [
      { name: { [Op.iLike]: pattern } },
      { description: { [Op.iLike]: pattern } },
    ];
  }

  const includeTables = [
    {
      model: Category,
      as: 'category',
      attributes: ['id', 'name'],
    },
  ];

  if (categoryIds.length === 1) {
    whereParams.category_id = categoryIds[0];
  } else if (categoryIds.length > 1) {
    whereParams.category_id = { [Op.in]: categoryIds };
  }

  if (tagIds.length > 0) {
    includeTables.push({
      model: TagPlace,
      as: 'tag_links',
      where: {
        tag_id: tagIds.length === 1 ? tagIds[0] : { [Op.in]: tagIds },
      },
      required: true,
    });
  }

  const places = await Place.findAll({
    where: whereParams,
    attributes: ['id', 'name', 'address', 'latitude', 'longitude', 'main_photo'],
    include: includeTables,
    order: [['id', 'ASC']],
  });

  return places.map((place) => ({
    id: place.id,
    name: place.name,
    address: place.address,
    latitude: place.latitude,
    longitude: place.longitude,
    main_photo: place.main_photo,
    category: place.category
      ? { id: place.category.id, name: place.category.name }
      : null,
  }));
};

const getPlaceById = async (placeId) => {
  const place = await Place.findByPk(placeId, {
    attributes: ['id', 'name', 'description', 'address', 'latitude', 'longitude', 'main_photo'],
    include: [
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'name'],
      },
      {
        model: PlacePhoto,
        as: 'photos',
        attributes: ['id', 'photo', 'order'],
      },
      {
        model: TagPlace,
        as: 'tag_links',
        attributes: ['id'],
        include: [
          {
            model: Tag,
            as: 'tag',
            attributes: ['id', 'name'],
          },
        ],
      },
    ],
    order: [
      [{ model: PlacePhoto, as: 'photos' }, 'order', 'ASC'],
      [{ model: PlacePhoto, as: 'photos' }, 'id', 'ASC'],
      [{ model: TagPlace, as: 'tag_links' }, { model: Tag, as: 'tag' }, 'name', 'ASC'],
    ],
  });

  if (!place) {
    return null;
  }

  return {
    id: place.id,
    name: place.name,
    description: place.description,
    address: place.address,
    latitude: place.latitude,
    longitude: place.longitude,
    main_photo: place.main_photo,
    category: place.category ? { id: place.category.id, name: place.category.name } : null,
    photos: (place.photos || []).map((photo) => ({
      id: photo.id,
      photo: photo.photo,
      order: photo.order,
    })),
    tags: (place.tag_links || [])
      .map((link) => link.tag)
      .filter(Boolean)
      .map((tag) => ({ id: tag.id, name: tag.name })),
  };
};

module.exports = {
  getAllPlaces,
  getPlaceById,
};
