const { uploadMaxFileSizeMb } = require('../services/uploadService');

const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Nizhny Travel API',
    version: '1.0.0',
    description: 'API for places, favorites and uploads.',
  },
  servers: [
    {
      url: 'http://localhost:5000',
    },
  ],
  tags: [
    { name: 'Places' },
    { name: 'Routes' },
    { name: 'Favorites' },
    { name: 'Upload' },
  ],
  paths: {
    '/api/places': {
      get: {
        tags: ['Places'],
        summary: 'Получить список достопримечательностей',
        parameters: [
          {
            name: 'search',
            in: 'query',
            required: false,
            schema: { type: 'string' },
            description: 'Поиск по имени или описанию',
          },
          {
            name: 'category',
            in: 'query',
            required: false,
            schema: { type: 'integer' },
            description: 'Фильтр по id категории',
          },
          {
            name: 'tag',
            in: 'query',
            required: false,
            schema: { type: 'integer' },
            description: 'Фильтр по id тега',
          },
        ],
        responses: {
          200: {
            description: 'Places list',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/PlaceListItem' },
                },
              },
            },
          },
        },
      },
    },
    '/api/places/{id}': {
      get: {
        tags: ['Places'],
        summary: 'Получить одну достопримечательность',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          200: {
            description: 'Place details',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PlaceDetails' },
              },
            },
          },
          404: {
            description: 'Place not found',
          },
        },
      },
    },
    '/api/favorite/{id}': {
      post: {
        tags: ['Favorites'],
        summary: 'Добавить место в избранное',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
          {
            name: 'x-user-id',
            in: 'header',
            required: false,
            schema: { type: 'integer', example: 2 },
          },
        ],
        responses: {
          201: { description: 'Added to favorites' },
          200: { description: 'Already in favorites' },
          404: { description: 'Place not found' },
        },
      },
    },
    '/api/routes': {
      get: {
        tags: ['Routes'],
        summary: 'Получит все маршруты',
        parameters: [
          {
            name: 'search',
            in: 'query',
            required: false,
            schema: { type: 'string' },
            description: 'Поиск по имени или описанию',
          },
        ],
        responses: {
          200: {
            description: 'Routes list',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/RouteListItem' },
                },
              },
            },
          },
        },
      },
    },
    '/api/routes/{id}': {
      get: {
        tags: ['Routes'],
        summary: 'Получить один маршрут',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          200: {
            description: 'Route details with points',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RouteDetails' },
              },
            },
          },
          404: {
            description: 'Route not found',
          },
        },
      },
    },
    '/api/favorites/{placeId}': {
      delete: {
        tags: ['Favorites'],
        summary: 'Удалить место из избранного',
        parameters: [
          {
            name: 'placeId',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
          {
            name: 'x-user-id',
            in: 'header',
            required: false,
            schema: { type: 'integer', example: 2 },
          },
        ],
        responses: {
          204: { description: 'Removed from favorites' },
          404: { description: 'Favorite not found' },
        },
      },
    },
    '/api/favorite-route/{id}': {
      post: {
        tags: ['Favorites'],
        summary: 'Добавить маршрут в избранное',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
          {
            name: 'x-user-id',
            in: 'header',
            required: false,
            schema: { type: 'integer', example: 2 },
          },
        ],
        responses: {
          201: { description: 'Added to favorite routes' },
          200: { description: 'Already in favorite routes' },
          404: { description: 'Route not found' },
        },
      },
    },
    '/api/favorite-routes/{routeId}': {
      delete: {
        tags: ['Favorites'],
        summary: 'Удалить маршрут из избранного',
        parameters: [
          {
            name: 'routeId',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
          {
            name: 'x-user-id',
            in: 'header',
            required: false,
            schema: { type: 'integer', example: 2 },
          },
        ],
        responses: {
          204: { description: 'Removed from favorite routes' },
          404: { description: 'Favorite route not found' },
        },
      },
    },
    '/api/upload': {
      post: {
        tags: ['Upload'],
        summary: 'Загрузить фото',
        description: `Max file size: ${uploadMaxFileSizeMb} MB.`,
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['file'],
                properties: {
                  file: {
                    type: 'string',
                    format: 'binary',
                  },
                  target: {
                    type: 'string',
                    enum: ['placeMain', 'placeGallery', 'routeMain'],
                    default: 'placeGallery',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'File uploaded',
          },
          400: {
            description: 'Validation error',
          },
        },
      },
    },
  },
  components: {
    schemas: {
      CategoryShort: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
        },
      },
      Tag: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
        },
      },
      PlacePhoto: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          photo: { type: 'string' },
          order: { type: 'integer' },
        },
      },
      PlaceListItem: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          address: { type: 'string' },
          latitude: { type: 'number' },
          longitude: { type: 'number' },
          main_photo: { type: 'string' },
          category: { $ref: '#/components/schemas/CategoryShort' },
        },
      },
      PlaceDetails: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          description: { type: 'string' },
          address: { type: 'string' },
          latitude: { type: 'number' },
          longitude: { type: 'number' },
          main_photo: { type: 'string' },
          category: { $ref: '#/components/schemas/CategoryShort' },
          photos: {
            type: 'array',
            items: { $ref: '#/components/schemas/PlacePhoto' },
          },
          tags: {
            type: 'array',
            items: { $ref: '#/components/schemas/Tag' },
          },
        },
      },
      RouteListItem: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          description: { type: 'string' },
          duration_minutes: { type: 'number' },
          distance_km: { type: 'number' },
          main_photo: { type: 'string' },
        },
      },
      RoutePoint: {
        type: 'object',
        properties: {
          order_index: { type: 'integer' },
          place: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' },
              address: { type: 'string' },
              latitude: { type: 'number' },
              longitude: { type: 'number' },
              main_photo: { type: 'string' },
            },
          },
        },
      },
      RouteDetails: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          description: { type: 'string' },
          duration_minutes: { type: 'number' },
          distance_km: { type: 'number' },
          main_photo: { type: 'string' },
          points: {
            type: 'array',
            items: { $ref: '#/components/schemas/RoutePoint' },
          },
        },
      },
    },
  },
};

module.exports = swaggerDocument;
