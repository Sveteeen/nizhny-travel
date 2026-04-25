'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();

    await queryInterface.bulkInsert('roles', [
      { id: 1, name: 'admin', createdAt: now, updatedAt: now },
      { id: 2, name: 'user', createdAt: now, updatedAt: now },
    ]);

    await queryInterface.bulkInsert('categories', [
      {
        id: 1,
        name: 'Архитектура и памятники',
        image: null,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 2,
        name: 'Музеи и галереи',
        image: null,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 3,
        name: 'Храмы и монастыри',
        image: null,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 4,
        name: 'Парки и набережные',
        image: null,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 5,
        name: 'Смотровые площадки',
        image: null,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 6,
        name: 'Культурные центры и театры',
        image: null,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 7,
        name: 'Научно-образовательные',
        image: null,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 8,
        name: 'Гастрономия и шопинг',
        image: null,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 9,
        name: 'Событийные места',
        image: null,
        createdAt: now,
        updatedAt: now,
      }
    ]);

    await queryInterface.bulkInsert('tags', [
      { id: 1, name: 'для семьи', createdAt: now, updatedAt: now },
      { id: 2, name: 'центр', createdAt: now, updatedAt: now },
      { id: 3, name: 'бесплатно', createdAt: now, updatedAt: now },
      { id: 4, name: 'пешеходный', createdAt: now, updatedAt: now },
      { id: 5, name: 'экскурсионный', createdAt: now, updatedAt: now },
      { id: 6, name: 'фотозона', createdAt: now, updatedAt: now },
      { id: 7, name: 'уличный', createdAt: now, updatedAt: now },
      { id: 8, name: 'рядом с метро', createdAt: now, updatedAt: now },
      { id: 9, name: 'требуется запись', createdAt: now, updatedAt: now },
      { id: 10, name: 'исторический', createdAt: now, updatedAt: now },
      { id: 11, name: 'современный', createdAt: now, updatedAt: now },
      { id: 12, name: 'романтичный', createdAt: now, updatedAt: now },
      { id: 13, name: 'детский', createdAt: now, updatedAt: now },
      { id: 14, name: 'в помещении', createdAt: now, updatedAt: now },
    ]);

    await queryInterface.bulkInsert('users', [
      {
        id: 1,
        email: 'admin@nizhny.travel',
        password: 'admin123',
        role_id: 1,
        username: 'admin',
        name: 'Администратор',
        phone: '+79000000001',
        avatar_url: null,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 2,
        email: 'user@nizhny.travel',
        password: 'user123',
        role_id: 2,
        username: 'demo_user',
        name: 'Демо Пользователь',
        phone: '+79000000002',
        avatar_url: null,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    await queryInterface.bulkInsert('places', [
      {
        id: 1,
        name: 'Нижегородский Кремль',
        description: 'Главный исторический комплекс города с башнями и стенами.',
        category_id: 1,
        address: 'Нижний Новгород, Кремль',
        latitude: 56.3287,
        longitude: 44.002,
        main_photo: '/uploads/places/main/kremlin.png',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 2,
        name: 'Чкаловская лестница',
        description: 'Одна из самых узнаваемых смотровых точек города.',
        category_id: 1,
        address: 'Нижний Новгород, Верхне-Волжская набережная',
        latitude: 56.3281,
        longitude: 44.0092,
        main_photo: '/uploads/places/main/chkalovStairs.jpg',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 3,
        name: 'Стрелка',
        description: 'Место слияния Оки и Волги, прогулочная и видовая зона.',
        category_id: 4,
        address: 'Нижний Новгород, Стрелка',
        latitude: 56.3373,
        longitude: 43.9633,
        main_photo: '/uploads/places/main/strelka.jfif',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 4,
        name: 'Усадьба Рукавишниковых',
        description: 'Музей с богатой экспозицией и архитектурой XIX века.',
        category_id: 2,
        address: 'Верхне-Волжская наб., 7',
        latitude: 56.3265,
        longitude: 44.0164,
        main_photo: '/uploads/places/main/rukavishnikov.jpg',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 5,
        name: 'Парк Швейцария',
        description: 'Большой городской парк для прогулок, отдыха и семейного досуга.',
        category_id: 4,
        address: 'пр. Гагарина, 35',
        latitude: 56.2825,
        longitude: 43.9854,
        main_photo: '/uploads/places/main/shveicaria.jpg',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 6,
        name: 'Музей ГАЗ',
        description: 'Музей истории Горьковского автомобильного завода и отечественного автопрома.',
        category_id: 2,
        address: 'пр. Ленина, 95',
        latitude: 56.2389,
        longitude: 43.8765,
        main_photo: '/uploads/places/main/gaz.jpg',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 7,
        name: 'НГХМ',
        description: 'Нижегородский государственный художественный музей с постоянными и временными экспозициями.',
        category_id: 2,
        address: 'Кремль, корпус 3',
        latitude: 56.3275,
        longitude: 44.0049,
        main_photo: '/uploads/places/main/nghm.jpg',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 8,
        name: 'Нижне-Волжская набережная',
        description: 'Популярная прогулочная зона вдоль Волги с городскими видами.',
        category_id: 4,
        address: 'Нижне-Волжская набережная',
        latitude: 56.3294,
        longitude: 44.0189,
        main_photo: '/uploads/places/main/nizhnevolskaya.jpg',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 9,
        name: 'Набережная Федоровского',
        description: 'Видовая набережная с панорамами на Стрелку и исторический центр.',
        category_id: 5,
        address: 'наб. Федоровского',
        latitude: 56.3238,
        longitude: 43.9954,
        main_photo: '/uploads/places/main/fedorovskogo.jpg',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 10,
        name: 'Александровский сад',
        description: 'Зеленая парковая зона рядом с историческим центром города.',
        category_id: 4,
        address: 'Верхне-Волжская набережная',
        latitude: 56.3246,
        longitude: 44.0225,
        main_photo: '/uploads/places/main/aleksandrovskiPark.jfif',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 11,
        name: 'Театр оперы и балета',
        description: 'Крупная театральная площадка города с оперными и балетными постановками.',
        category_id: 6,
        address: 'ул. Белинского, 59',
        latitude: 56.3132,
        longitude: 44.0039,
        main_photo: '/uploads/places/main/theatreOperaBalet.webp',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 12,
        name: 'Нижегородская ярмарка',
        description: 'Исторический выставочный и событийный комплекс с современной программой мероприятий.',
        category_id: 9,
        address: 'ул. Совнаркомовская, 13',
        latitude: 56.3378,
        longitude: 43.9608,
        main_photo: '/uploads/places/main/yarmarka.jpg',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 13,
        name: 'ЦЕХ',
        description: 'Современное культурное пространство для выставок, лекций и городских событий.',
        category_id: 6,
        address: 'Варварская ул., 32',
        latitude: 56.3229,
        longitude: 44.0078,
        main_photo: '/uploads/places/main/tsekh.webp',
        createdAt: now,
        updatedAt: now,
      },
    ]);

    await queryInterface.bulkInsert('places_photos', [
      {
        id: 1,
        place_id: 1,
        photo: '/uploads/places/gallery/kremlin1.jpg',
        order: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 2,
        place_id: 1,
        photo: '/uploads/places/gallery/kremlin2.jpg',
        order: 2,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 3,
        place_id: 1,
        photo: '/uploads/places/gallery/kremlin3.jpg',
        order: 3,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 4,
        place_id: 1,
        photo: '/uploads/places/gallery/kremlin4.jpg',
        order: 4,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 5,
        place_id: 1,
        photo: '/uploads/places/gallery/kremlin5.jpg',
        order: 5,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 6,
        place_id: 1,
        photo: '/uploads/places/gallery/kremlin6.jpg',
        order: 6,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    await queryInterface.bulkInsert('tags_places', [
      { id: 1, tag_id: 10, place_id: 1, createdAt: now, updatedAt: now },
      { id: 2, tag_id: 7, place_id: 1, createdAt: now, updatedAt: now },
      { id: 3, tag_id: 4, place_id: 2, createdAt: now, updatedAt: now },
      { id: 4, tag_id: 6, place_id: 2, createdAt: now, updatedAt: now },
      { id: 5, tag_id: 12, place_id: 3, createdAt: now, updatedAt: now },
      { id: 6, tag_id: 13, place_id: 3, createdAt: now, updatedAt: now },
      { id: 7, tag_id: 3, place_id: 3, createdAt: now, updatedAt: now },
      { id: 8, tag_id: 14, place_id: 4, createdAt: now, updatedAt: now },
      { id: 9, tag_id: 9, place_id: 4, createdAt: now, updatedAt: now },
    ]);

    await queryInterface.bulkInsert('favourite_places', [
      { id: 1, user_id: 2, place_id: 1, createdAt: now, updatedAt: now },
      { id: 2, user_id: 2, place_id: 3, createdAt: now, updatedAt: now },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('favourite_routes', null, {});
    await queryInterface.bulkDelete('favourite_places', null, {});
    await queryInterface.bulkDelete('tags_places', null, {});
    await queryInterface.bulkDelete('places_photos', null, {});
    await queryInterface.bulkDelete('routes_places', null, {});
    await queryInterface.bulkDelete('routes', null, {});
    await queryInterface.bulkDelete('places', null, {});
    await queryInterface.bulkDelete('users', null, {});
    await queryInterface.bulkDelete('tags', null, {});
    await queryInterface.bulkDelete('categories', null, {});
    await queryInterface.bulkDelete('roles', null, {});
  },
};
