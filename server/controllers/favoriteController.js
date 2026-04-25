const favoriteService = require('../services/favoriteService');

const getCurrentUserId = (req) => {
  const rawUserId = req.body?.userId || req.query?.userId || req.headers['x-user-id'] || 2;
  const parsed = Number(rawUserId);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
};

const addPlaceToFavorites = async (req, res, next) => {
  try {
    const placeId = Number(req.params.id);
    if (!Number.isInteger(placeId) || placeId <= 0) {
      return res.status(400).json({ error: 'Invalid place id' });
    }

    const userId = getCurrentUserId(req);
    if (!userId) {
      return res.status(400).json({ error: 'Invalid user id' });
    }

    const result = await favoriteService.addPlaceToFavorites({ userId, placeId });
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

    const userId = getCurrentUserId(req);
    if (!userId) {
      return res.status(400).json({ error: 'Invalid user id' });
    }

    const deleted = await favoriteService.removePlaceFromFavorites({ userId, placeId });
    if (!deleted) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  addPlaceToFavorites,
  removePlaceFromFavorites,
};
