const { Op } = require('sequelize');
const { Route, RoutePlace, Place } = require('../db/models');

const getRoutes = async (filter = {}) => {
  const { search, category = [], tag = [] } = filter;
  const whereParams = {};

  if (search) {
    const pattern = `%${search.trim()}%`;
    whereParams[Op.or] = [
      { name: { [Op.iLike]: pattern }},
      { description: { [Op.iLike]: pattern }},
    ];
  }

  const routes = await Route.findAll({
    where: whereParams,
    attributes: ['id', 'name', 'description', 'duration_minutes', 'distance_km', 'main_photo'],
    order: [['id', 'ASC']],
  });

  return routes.map((route) => ({
    id: route.id,
    name: route.name,
    description: route.description,
    duration_minutes: route.duration_minutes,
    distance_km: route.distance_km,
    main_photo: route.main_photo,
  }));
};

const getRouteById = async (routeId) => {
  const route = await Route.findByPk(routeId, {
    attributes: ['id', 'name', 'description', 'duration_minutes', 'distance_km', 'main_photo'],
    include: [
      {
        model: RoutePlace,
        as: 'route_places',
        attributes: ['id', 'order_index'],
        include: [
          {
            model: Place,
            as: 'place',
            attributes: ['id', 'name', 'address', 'latitude', 'longitude', 'main_photo'],
          },
        ],
      },
    ],
    order: [[{ model: RoutePlace, as: 'route_places' }, 'order_index', 'ASC']],
  });

  if (!route) {
    return null;
  }

  return {
    id: route.id,
    name: route.name,
    description: route.description,
    duration_minutes: route.duration_minutes,
    distance_km: route.distance_km,
    main_photo: route.main_photo,
    points: (route.route_places || []).map((item) => ({
      order_index: item.order_index,
      place: item.place
        ? {
            id: item.place.id,
            name: item.place.name,
            address: item.place.address,
            latitude: item.place.latitude,
            longitude: item.place.longitude,
            main_photo: item.place.main_photo,
          }
        : null,
    })),
  };
};

module.exports = {
  getRoutes,
  getRouteById,
};
