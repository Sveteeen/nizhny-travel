const { uploadMaxFileSizeMb } = require('../services/uploadService');

const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Nizhny Travel API',
    version: '1.0.0',
    description: 'API for places, favorites, auth and uploads.',
  },
  servers: [
    {
      url: 'http://localhost:5000',
    },
  ],
  tags: [
    { name: 'Auth' },
    { name: 'Places' },
    { name: 'Routes' },
    { name: 'Favorites' },
    { name: 'Upload' },
  ],
  paths: {
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Регистрация пользователя',
        description:
          'Создаёт пользователя.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' },
              examples: {
                minimal: {
                  summary: 'Только обязательные поля',
                  value: {
                    email: 'newuser@mail.ru',
                    password: 'secret12',
                  },
                },
                full: {
                  summary: 'С профилем',
                  value: {
                    email: 'newuser@mail.ru',
                    password: 'secret12',
                    username: 'traveler_nn',
                    name: 'Иван Иванов',
                    phone: '+79001234567',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Пользователь создан',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          400: {
            description: 'Не переданы email или password',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' },
                example: { error: 'Введите почту и пароль.' },
              },
            },
          },
          409: {
            description: 'Почта или username уже заняты',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' },
                example: { error: 'Почта или имя пользователя уже заняты.' },
              },
            },
          },
          500: {
            description: 'Внутренняя ошибка сервера',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' },
              },
            },
          },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Вход (авторизация)',
        description:
          'Проверяет email и пароль. В ответе — профиль пользователя без пароля и JWT-токен. Токен передавать в заголовке `Authorization: Bearer <token>`.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
              examples: {
                demoAdmin: {
                  summary: 'Демо-администратор из сидера',
                  value: {
                    email: 'admin@nizhny.travel',
                    password: 'admin123',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Успешный вход',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          400: {
            description: 'Не переданы email или password',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' },
                example: { error: 'Введите почту и пароль.' },
              },
            },
          },
          401: {
            description: 'Неверные учётные данные или пользователь не найден',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' },
                examples: {
                  notFound: {
                    summary: 'Почта не найдена',
                    value: { error: 'Пользователь с такой почтой не зарегистрирован.' },
                  },
                  wrongPassword: {
                    summary: 'Неверный пароль',
                    value: { error: 'Неправильные пароль или почта.' },
                  },
                },
              },
            },
          },
          500: {
            description: 'Внутренняя ошибка сервера',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' },
              },
            },
          },
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Текущий пользователь',
        description:
          'Возвращает профиль пользователя по JWT из заголовка `Authorization: Bearer <token>`.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Профиль текущего пользователя',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UserMe' },
              },
            },
          },
          401: {
            description: 'Нет токена, неверный или просроченный JWT',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' },
                examples: {
                  missing: {
                    summary: 'Нет заголовка Authorization',
                    value: { error: 'Unauthorized' },
                  },
                  invalid: {
                    summary: 'Битый или просроченный токен',
                    value: { error: 'Invalid or expired token' },
                  },
                },
              },
            },
          },
          404: {
            description: 'Пользователь из токена не найден в БД',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' },
                example: { error: 'Пользователь не найден' },
              },
            },
          },
          500: {
            description: 'Внутренняя ошибка сервера',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ApiError' },
              },
            },
          },
        },
      },
    },
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
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          201: { description: 'Added to favorites' },
          200: { description: 'Already in favorites' },
          401: { description: 'Нет или невалидный JWT' },
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
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'placeId',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          204: { description: 'Removed from favorites' },
          401: { description: 'Нет или невалидный JWT' },
          404: { description: 'Favorite not found' },
        },
      },
    },
    '/api/favorite-route/{id}': {
      post: {
        tags: ['Favorites'],
        summary: 'Добавить маршрут в избранное',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          201: { description: 'Added to favorite routes' },
          200: { description: 'Already in favorite routes' },
          401: { description: 'Нет или невалидный JWT' },
          404: { description: 'Route not found' },
        },
      },
    },
    '/api/favorite-routes/{routeId}': {
      delete: {
        tags: ['Favorites'],
        summary: 'Удалить маршрут из избранного',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'routeId',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          204: { description: 'Removed from favorite routes' },
          401: { description: 'Нет или невалидный JWT' },
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
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'JWT из ответа POST /api/auth/login или POST /api/auth/register (поле token).',
      },
    },
    schemas: {
      ApiError: {
        type: 'object',
        properties: {
          error: { type: 'string' },
        },
        required: ['error'],
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'user@nizhny.travel',
            description: 'Email (при поиске приводится к нижнему регистру)',
          },
          password: {
            type: 'string',
            format: 'password',
            example: 'user123',
          },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'newuser@mail.ru',
            description: 'Уникальный email (сохраняется в нижнем регистре)',
          },
          password: {
            type: 'string',
            format: 'password',
            example: 'secret12',
          },
          username: {
            type: 'string',
            nullable: true,
            example: 'traveler_nn',
            description: 'Уникальный логин (необязательно, приводится к нижнему регистру)',
          },
          name: {
            type: 'string',
            nullable: true,
            example: 'Иван Иванов',
          },
          phone: {
            type: 'string',
            nullable: true,
            example: '+79001234567',
          },
        },
      },
      UserPublic: {
        type: 'object',
        description: 'Пользователь без поля password',
        properties: {
          id: { type: 'integer', example: 3 },
          email: { type: 'string', format: 'email', example: 'user@nizhny.travel' },
          role_id: { type: 'integer', example: 2, description: '2 — user, 1 — admin' },
          username: { type: 'string', nullable: true, example: 'demo_user' },
          name: { type: 'string', nullable: true, example: 'Демо Пользователь' },
          phone: { type: 'string', nullable: true },
          avatar_url: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/UserPublic' },
          token: {
            type: 'string',
            description: 'JWT. Передавать в заголовке: Authorization: Bearer <token>',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          },
        },
        required: ['user', 'token'],
      },
      RoleShort: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 2 },
          name: { type: 'string', example: 'user' },
        },
      },
      UserMe: {
        allOf: [
          { $ref: '#/components/schemas/UserPublic' },
          {
            type: 'object',
            properties: {
              role: { $ref: '#/components/schemas/RoleShort' },
            },
          },
        ],
      },
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
