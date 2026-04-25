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
    { name: 'Favorites' },
    { name: 'Upload' },
  ],
  paths: {
    '/api/places': {
      get: {
        tags: ['Places'],
        summary: 'Get places list',
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
        summary: 'Get place details',
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
        summary: 'Add place to favorites',
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
    '/api/favorites/{placeId}': {
      delete: {
        tags: ['Favorites'],
        summary: 'Remove place from favorites',
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
    '/api/upload': {
      post: {
        tags: ['Upload'],
        summary: 'Upload image file',
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
    },
  },
};

module.exports = swaggerDocument;
