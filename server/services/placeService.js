const { Place, Category, PlacePhoto, TagPlace, Tag } = require('../db/models');

const getAllPlaces = async () => {
  const places = await Place.findAll({
    attributes: ['id', 'name', 'address', 'latitude', 'longitude', 'main_photo'],
    include: [
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'name'],
      },
    ],
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
