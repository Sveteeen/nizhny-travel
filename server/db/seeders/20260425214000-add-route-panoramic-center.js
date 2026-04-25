'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();

    await queryInterface.bulkInsert('routes', [
      {
        id: 1,
        name: 'Самые панорамные места центра',
        description:
          'Прогулка от набережной Федоровского по главной пешеходной улице Большой Покровской, через Кремль и Чкаловскую лестницу, затем через живописный Александровский сад к Нижне-Волжской набережной.',
        main_photo: '/uploads/routes/main/route1.jpg',
        duration_minutes: 180,
        distance_km: 4,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 2,
        name: 'Художественный Нижний',
        description: 'По музеям, театру и современному искусству.',
        main_photo: '/uploads/routes/main/route2.jpg',
        duration_minutes: 120,
        distance_km: 3,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 3,
        name: 'От парка до ярмарки',
        description: 'Спокойная прогулка по зелёной зоне и набережной до исторической ярмарки.',
        main_photo: '/uploads/routes/main/route3.jpg',
        duration_minutes: 180,
        distance_km: 6,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    await queryInterface.bulkInsert('routes_places', [
      { id: 1001, route_id: 1, place_id: 9, order_index: 1, createdAt: now, updatedAt: now },
      { id: 1002, route_id: 1, place_id: 1, order_index: 2, createdAt: now, updatedAt: now },
      { id: 1003, route_id: 1, place_id: 2, order_index: 3, createdAt: now, updatedAt: now },
      { id: 1004, route_id: 1, place_id: 10, order_index: 4, createdAt: now, updatedAt: now },
      { id: 1005, route_id: 1, place_id: 8, order_index: 5, createdAt: now, updatedAt: now },
      { id: 1006, route_id: 2, place_id: 4, order_index: 1, createdAt: now, updatedAt: now },
      { id: 1007, route_id: 2, place_id: 7, order_index: 2, createdAt: now, updatedAt: now },
      { id: 1008, route_id: 2, place_id: 11, order_index: 3, createdAt: now, updatedAt: now },
      { id: 1009, route_id: 2, place_id: 13, order_index: 4, createdAt: now, updatedAt: now },
      { id: 1010, route_id: 3, place_id: 10, order_index: 1, createdAt: now, updatedAt: now },
      { id: 1011, route_id: 3, place_id: 8, order_index: 2, createdAt: now, updatedAt: now },
      { id: 1012, route_id: 3, place_id: 3, order_index: 3, createdAt: now, updatedAt: now },
      { id: 1013, route_id: 3, place_id: 12, order_index: 4, createdAt: now, updatedAt: now },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('routes_places', {
      id: [1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010, 1011, 1012, 1013],
    });

    await queryInterface.bulkDelete('routes', {
      id: [1, 2, 3],
    });
  },
};
