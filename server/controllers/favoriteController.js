const favoriteService = require('../services/favoriteService');

const addPlaceToFavorites = async (req, res, next) => {
  try {
    const placeId = Number(req.params.id);
    if (!Number.isInteger(placeId) || placeId <= 0) {
      return res.status(400).json({ error: 'Invalid place id' });
    }

    const result = await favoriteService.addPlaceToFavorites({
      userId: req.userId,
      placeId,
    });
    if (result.status === 'place_not_found') {
      return res.status(404).json({ error: 'Place not found' });
    }

    return res.status(result.status === 'created' ? 201 : 200).json({
      message: result.status === 'created' ? 'Added to favorites' : 'Already in favorites',
      favorite: result.favorite,
    });
  } catch (err) {
    return next(err);
  }
};

const removePlaceFromFavorites = async (req, res, next) => {
  try {
    const placeId = Number(req.params.placeId);
    if (!Number.isInteger(placeId) || placeId <= 0) {
      return res.status(400).json({ error: 'Invalid place id' });
    }

    const deleted = await favoriteService.removePlaceFromFavorites({
      userId: req.userId,
      placeId,
    });
    if (!deleted) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
};

const addRouteToFavorites = async (req, res, next) => {
  try {
    const routeId = Number(req.params.id);
    if (!Number.isInteger(routeId) || routeId <= 0) {
      return res.status(400).json({ error: 'Invalid route id' });
    }

    const result = await favoriteService.addRouteToFavorites({
      userId: req.userId,
      routeId,
    });
    if (result.status === 'route_not_found') {
      return res.status(404).json({ error: 'Route not found' });
    }

    return res.status(result.status === 'created' ? 201 : 200).json({
      message: result.status === 'created' ? 'Added to favorites' : 'Already in favorites',
      favorite: result.favorite,
    });
  } catch (err) {
    return next(err);
  }
};

const removeRouteFromFavorites = async (req, res, next) => {
  try {
    const routeId = Number(req.params.routeId);
    if (!Number.isInteger(routeId) || routeId <= 0) {
      return res.status(400).json({ error: 'Invalid route id' });
    }

    const deleted = await favoriteService.removeRouteFromFavorites({
      userId: req.userId,
      routeId,
    });
    if (!deleted) {
      return res.status(404).json({ error: 'Favorite route not found' });
    }

    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  addPlaceToFavorites,
  removePlaceFromFavorites,
  addRouteToFavorites,
  removeRouteFromFavorites,
};
