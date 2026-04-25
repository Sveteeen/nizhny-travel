const routeService = require('../services/routeService');

const getRoutes = async (req, res, next) => {
  try {
    const routes = await routeService.getRoutes();
    return res.json(routes);
  } catch (err) {
    return next(err);
  }
};

const getRouteById = async (req, res, next) => {
  try {
    const routeId = Number(req.params.id);
    if (!Number.isInteger(routeId) || routeId <= 0) {
      return res.status(400).json({ error: 'Invalid route id' });
    }

    const route = await routeService.getRouteById(routeId);
    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }

    return res.json(route);
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getRoutes,
  getRouteById,
};
