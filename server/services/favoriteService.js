const { Place, Route, FavouritePlace, FavouriteRoute } = require('../db/models');

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

const addRouteToFavorites = async ({ userId, routeId }) => {
  const route = await Route.findByPk(routeId, { attributes: ['id'] });
  if (!route) {
    return { status: 'route_not_found' };
  }

  const [favorite, created] = await FavouriteRoute.findOrCreate({
    where: { user_id: userId, route_id: routeId },
    defaults: { user_id: userId, route_id: routeId },
  });

  return {
    status: created ? 'created' : 'exists',
    favorite: {
      id: favorite.id,
      user_id: favorite.user_id,
      route_id: favorite.route_id,
    },
  };
};

const removeRouteFromFavorites = async ({ userId, routeId }) => {
  const deleted = await FavouriteRoute.destroy({
    where: { user_id: userId, route_id: routeId },
  });

  return deleted > 0;
};

const getFavouritePlaces = async (userId) => {
  const places = await FavouritePlace.findAll({
    where: { user_id: userId },
    attributes: [ 'place_id' ],
  });

  if (!places) return [];

  return places;
};

const getFavouriteRoutes = async (userId) => {
  const routes = await FavouriteRoute.findAll({
    where: { user_id: userId },
    attributes: [ 'route_id' ],
  });

  if (!routes) return [];

  return routes;
};

module.exports = {
  addPlaceToFavorites,
  removePlaceFromFavorites,
  addRouteToFavorites,
  removeRouteFromFavorites,
  getFavouritePlaces,
  getFavouriteRoutes,
};
