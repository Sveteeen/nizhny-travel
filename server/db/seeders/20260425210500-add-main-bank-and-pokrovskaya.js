'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();

    await queryInterface.bulkInsert('places', [
      {
        id: 14,
        name: 'Главный банк',
        description: 'Историческое здание Государственного банка в центре Нижнего Новгорода.',
        category_id: 1,
        address: 'ул. Большая Покровская, 26',
        latitude: 56.3204,
        longitude: 44.0009,
        main_photo: '/uploads/places/main/mainBank.jpg',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 15,
        name: 'Большая Покровская',
        description: 'Главная пешеходная улица города с архитектурой, кафе и городскими скульптурами.',
        category_id: 1,
        address: 'ул. Большая Покровская',
        latitude: 56.3202,
        longitude: 44.0017,
        main_photo: '/uploads/places/main/pokrovskaya.jpg',
        createdAt: now,
        updatedAt: now,
      },
    ]);

    await queryInterface.bulkInsert('tags_places', [
      { id: 10, tag_id: 10, place_id: 14, createdAt: now, updatedAt: now },
      { id: 11, tag_id: 2, place_id: 14, createdAt: now, updatedAt: now },
      { id: 12, tag_id: 4, place_id: 15, createdAt: now, updatedAt: now },
      { id: 13, tag_id: 2, place_id: 15, createdAt: now, updatedAt: now },
      { id: 14, tag_id: 10, place_id: 15, createdAt: now, updatedAt: now },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('tags_places', {
      id: [10, 11, 12, 13, 14],
    });

    await queryInterface.bulkDelete('places', {
      id: [14, 15],
    });
  },
};
