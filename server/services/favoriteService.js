const { Place, FavouritePlace } = require('../db/models');

const addPlaceToFavorites = async ({ userId, placeId }) => {
  const place = await Place.findByPk(placeId, { attributes: ['id'] });
  if (!place) {
    return { status: 'place_not_found' };
  }

  const [favorite, created] = await FavouritePlace.findOrCreate({
    where: { user_id: userId, place_id: placeId },
    defaults: { user_id: userId, place_id: placeId },
  });

  return {
    status: created ? 'created' : 'exists',
    favorite: {
      id: favorite.id,
      user_id: favorite.user_id,
      place_id: favorite.place_id,
    },
  };
};

const removePlaceFromFavorites = async ({ userId, placeId }) => {
  const deleted = await FavouritePlace.destroy({
    where: { user_id: userId, place_id: placeId },
  });

  return deleted > 0;
};

module.exports = {
  addPlaceToFavorites,
  removePlaceFromFavorites,
};
