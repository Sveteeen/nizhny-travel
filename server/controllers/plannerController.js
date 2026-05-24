const plannerService = require('../services/plannerService');

const mapPlannerError = (error) => {
  const code = error.code || 'internal_error';

  if (code === 'invalid_request' || code === 'invalid_points' || code === 'too_many_points') {
    return { status: 400, body: { error: error.message, code } };
  }

  if (code === 'auth_required') {
    return { status: 401, body: { error: error.message, code } };
  }

  if (code === 'not_in_favorites') {
    return {
      status: 403,
      body: {
        error: error.message,
        code,
        place_ids: error.placeIds,
      },
    };
  }

  if (code === 'places_not_found' || code === 'saved_route_not_found') {
    return {
      status: 404,
      body: {
        error: error.message,
        code,
        missing_ids: error.missingIds,
      },
    };
  }

  if (code === 'route_unavailable') {
    return { status: 422, body: { error: error.message, code } };
  }

  if (code === 'rate_limit') {
    return { status: 429, body: { error: error.message, code } };
  }

  if (
    code === 'missing_api_key' ||
    code === 'invalid_api_key' ||
    code === 'timeout' ||
    code === 'network_error' ||
    code === 'router_error' ||
    code === 'empty_route'
  ) {
    return { status: 502, body: { error: error.message, code } };
  }

  return { status: 500, body: { error: 'Something went wrong', code } };
};

const handlePlannerError = (error, res, next) => {
  const mapped = mapPlannerError(error);
  if (mapped.status >= 500) {
    return next(error);
  }
  return res.status(mapped.status).json(mapped.body);
};

const buildRoute = async (req, res, next) => {
  try {
    const { placeIds, startPlaceId, optimize, source } = req.body ?? {};

    const result = await plannerService.buildRoutePreview({
      placeIds,
      startPlaceId: startPlaceId ?? null,
      optimize: optimize !== false,
      source: source ?? 'all',
      userId: req.userId ?? null,
    });

    return res.json(result);
  } catch (error) {
    return handlePlannerError(error, res, next);
  }
};

const saveRoute = async (req, res, next) => {
  try {
    const { name, preview } = req.body ?? {};
    const result = await plannerService.saveRoute({
      userId: req.userId,
      name,
      preview,
    });

    return res.status(201).json(result);
  } catch (error) {
    return handlePlannerError(error, res, next);
  }
};

const listSavedRoutes = async (req, res, next) => {
  try {
    const routes = await plannerService.listSavedRoutes(req.userId);
    return res.json(routes);
  } catch (error) {
    return handlePlannerError(error, res, next);
  }
};

const getSavedRoute = async (req, res, next) => {
  try {
    const savedRouteId = Number(req.params.id);
    if (!Number.isInteger(savedRouteId) || savedRouteId <= 0) {
      return res.status(400).json({ error: 'Invalid saved route id' });
    }

    const route = await plannerService.getSavedRouteById({
      userId: req.userId,
      savedRouteId,
    });

    return res.json(route);
  } catch (error) {
    return handlePlannerError(error, res, next);
  }
};

const deleteSavedRoute = async (req, res, next) => {
  try {
    const savedRouteId = Number(req.params.id);
    if (!Number.isInteger(savedRouteId) || savedRouteId <= 0) {
      return res.status(400).json({ error: 'Invalid saved route id' });
    }

    await plannerService.deleteSavedRoute({
      userId: req.userId,
      savedRouteId,
    });

    return res.status(204).send();
  } catch (error) {
    return handlePlannerError(error, res, next);
  }
};

module.exports = {
  buildRoute,
  saveRoute,
  listSavedRoutes,
  getSavedRoute,
  deleteSavedRoute,
};
