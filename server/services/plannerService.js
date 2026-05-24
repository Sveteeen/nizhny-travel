const { Op } = require('sequelize');
const { Place, FavouritePlace } = require('../db/models');
const {
  buildWalkingRoute,
  MAX_WALKING_WAYPOINTS,
} = require('./yandexRouterService');

const normalizePlaceIds = (placeIds) => {
  if (!Array.isArray(placeIds)) {
    return { error: 'placeIds must be an array' };
  }

  const parsed = placeIds.map((id) => Number(id));
  if (parsed.some((id) => !Number.isInteger(id) || id <= 0)) {
    return { error: 'Each place id must be a positive integer' };
  }

  const unique = [...new Set(parsed)];
  if (unique.length !== parsed.length) {
    return { error: 'Duplicate place ids are not allowed' };
  }

  if (unique.length < 2) {
    return { error: 'Select at least two places' };
  }

  if (unique.length > MAX_WALKING_WAYPOINTS) {
    return {
      error: `You can select up to ${MAX_WALKING_WAYPOINTS} places for one route`,
    };
  }

  return { placeIds: unique };
};

const orderWithStartPlace = (placeIds, startPlaceId) => {
  if (startPlaceId == null) {
    return { placeIds };
  }

  const startId = Number(startPlaceId);
  if (!placeIds.includes(startId)) {
    return { error: 'startPlaceId must be one of the selected places' };
  }

  return {
    placeIds: [startId, ...placeIds.filter((id) => id !== startId)],
  };
};

const loadPlacesByIds = async (placeIds) => {
  const places = await Place.findAll({
    where: { id: { [Op.in]: placeIds } },
    attributes: ['id', 'name', 'address', 'latitude', 'longitude', 'main_photo'],
  });

  if (places.length !== placeIds.length) {
    const foundIds = new Set(places.map((place) => place.id));
    const missingIds = placeIds.filter((id) => !foundIds.has(id));
    return { error: 'Some places were not found', missingIds };
  }

  const byId = new Map(places.map((place) => [place.id, place]));
  return {
    places: placeIds.map((id) => byId.get(id)),
  };
};

const assertFavoritePlaces = async ({ userId, placeIds }) => {
  const favorites = await FavouritePlace.findAll({
    where: { user_id: userId, place_id: { [Op.in]: placeIds } },
    attributes: ['place_id'],
  });

  const favoriteIds = new Set(favorites.map((item) => item.place_id));
  const notFavoriteIds = placeIds.filter((id) => !favoriteIds.has(id));

  if (notFavoriteIds.length > 0) {
    return { error: 'Some places are not in your favorites', placeIds: notFavoriteIds };
  }

  return null;
};

const buildRoutePreview = async ({
  placeIds,
  startPlaceId = null,
  optimize = true,
  source = 'all',
  userId = null,
}) => {
  const normalized = normalizePlaceIds(placeIds);
  if (normalized.error) {
    const error = new Error(normalized.error);
    error.code = 'invalid_request';
    throw error;
  }

  const ordered = orderWithStartPlace(normalized.placeIds, startPlaceId);
  if (ordered.error) {
    const error = new Error(ordered.error);
    error.code = 'invalid_request';
    throw error;
  }

  if (source === 'favorites') {
    if (!userId) {
      const error = new Error('Authorization required to build a route from favorites');
      error.code = 'auth_required';
      throw error;
    }

    const favoriteError = await assertFavoritePlaces({
      userId,
      placeIds: ordered.placeIds,
    });
    if (favoriteError) {
      const error = new Error(favoriteError.error);
      error.code = 'not_in_favorites';
      error.placeIds = favoriteError.placeIds;
      throw error;
    }
  } else if (source !== 'all') {
    const error = new Error('source must be "all" or "favorites"');
    error.code = 'invalid_request';
    throw error;
  }

  const loaded = await loadPlacesByIds(ordered.placeIds);
  if (loaded.error) {
    const error = new Error(loaded.error);
    error.code = 'places_not_found';
    error.missingIds = loaded.missingIds;
    throw error;
  }

  const routePoints = loaded.places.map((place) => ({
    placeId: place.id,
    name: place.name,
    latitude: place.latitude,
    longitude: place.longitude,
  }));

  const route = await buildWalkingRoute({
    points: routePoints,
    optimize,
  });

  const placeById = new Map(
    loaded.places.map((place) => [
      place.id,
      {
        address: place.address,
        main_photo: place.main_photo,
      },
    ]),
  );

  return {
    ordered_places: route.orderedPoints.map((point) => ({
      place_id: point.placeId,
      order_index: point.orderIndex,
      name: point.name,
      address: placeById.get(point.placeId)?.address ?? null,
      latitude: point.latitude,
      longitude: point.longitude,
      main_photo: placeById.get(point.placeId)?.main_photo ?? null,
      leg_duration_minutes: point.legDurationMinutes,
      leg_distance_km: point.legDistanceKm,
    })),
    distance_km: route.distanceKm,
    duration_minutes: route.durationMinutes,
    geometry: route.geometry,
    optimized: route.optimized,
    start_place_id: startPlaceId != null ? Number(startPlaceId) : ordered.placeIds[0],
  };
};

module.exports = {
  buildRoutePreview,
  MAX_WALKING_WAYPOINTS,
};
