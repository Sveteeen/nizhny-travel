const placeService = require('../services/placeService');

const getPlaces = async (req, res, next) => {
  try {
    const filter = req.query;
    const places = await placeService.getAllPlaces(filter);
    return res.json(places);
  } catch (err) {
    return next(err);
  }
};

const getPlaceById = async (req, res, next) => {
  try {
    const placeId = Number(req.params.id);
    if (!Number.isInteger(placeId) || placeId <= 0) {
      return res.status(400).json({ error: 'Invalid place id' });
    }

    const place = await placeService.getPlaceById(placeId);
    if (!place) {
      return res.status(404).json({ error: 'Place not found' });
    }

    return res.json(place);
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getPlaces,
  getPlaceById,
};
