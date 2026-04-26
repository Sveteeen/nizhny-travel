'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();

    await queryInterface.bulkInsert('places', [
      {
        id: 16,
        name: 'Нижегородский государственный академический театр драмы имени М. Горького',
        description: 'Один из старейших театров России с репертуаром классики и современных постановок.',
        category_id: 6,
        address: 'ул. Большая Покровская, 13',
        latitude: 56.3232,
        longitude: 44.0042,
        main_photo: '/uploads/places/main/theatreDrama.jfif',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 17,
        name: 'Канатная дорога',
        description: 'Самая большая в Европе канатная переправа через Волгу с панорамными видами на Нижний Новгород и Бор.',
        category_id: 5,
        address: 'Казанская набережная, 8А',
        latitude: 56.3299,
        longitude: 44.0666,
        main_photo: '/uploads/places/main/kanatnayaRoad.jpeg',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 18,
        name: 'Александро-Невский собор',
        description: 'Кафедральный собор на Стрелке, один из крупнейших храмов города.',
        category_id: 3,
        address: 'ул. Стрелка, 3А',
        latitude: 56.3359,
        longitude: 43.9648,
        main_photo: '/uploads/places/main/aleksandroNevskiSobor.jpg',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 19,
        name: 'Сормовский парк',
        description: 'Крупный парк в Сормовском районе с аттракционами и прогулочными зонами.',
        category_id: 4,
        address: 'Юбилейный бульвар, 30',
        latitude: 56.3553,
        longitude: 43.8596,
        main_photo: '/uploads/places/main/sormovskiPark.webp',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 20,
        name: 'Вознесенский Печерский монастырь',
        description: 'Древний монастырский комплекс с богатой историей и архитектурой.',
        category_id: 3,
        address: 'Приволжская слобода, 108',
        latitude: 56.3188,
        longitude: 44.0497,
        main_photo: '/uploads/places/main/vosnesenskiPecherskiChurch.jpg',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 21,
        name: 'Планетарий имени Г. М. Гречко',
        description: 'Научно-популярный центр с программами о космосе для детей и взрослых.',
        category_id: 7,
        address: 'ул. Революционная, 20',
        latitude: 56.322,
        longitude: 43.9398,
        main_photo: '/uploads/places/main/planetari.webp',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 22,
        name: 'Щёлоковский хутор',
        description: 'Лесопарковая территория и музей деревянного зодчества под открытым небом.',
        category_id: 4,
        address: 'Анкудиновское шоссе, 2',
        latitude: 56.2876,
        longitude: 44.0412,
        main_photo: '/uploads/places/main/shchelkovskiHutor.jpg',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 23,
        name: 'Аквапарк «Океанис»',
        description: 'Современный аквапарк с горками, бассейнами и семейными зонами отдыха.',
        category_id: 9,
        address: 'пр. Гагарина, 35к1',
        latitude: 56.2821,
        longitude: 43.9839,
        main_photo: '/uploads/places/main/acuaPark.jpg',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 24,
        name: 'Парк 800-летия Нижнего Новгорода',
        description: 'Благоустроенное общественное пространство с видами на Волгу и город.',
        category_id: 4,
        address: 'Петушковская гора',
        latitude: 56.3258,
        longitude: 43.9847,
        main_photo: '/uploads/places/main/park800.jpg',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 25,
        name: 'Парк «Моховые горы»',
        description: 'Живописная природная зона в Борском районе с обзорными точками на Волгу.',
        category_id: 4,
        address: 'г. Бор, Моховые горы',
        latitude: 56.3778,
        longitude: 44.1336,
        main_photo: '/uploads/places/main/mohovMountPark.jpg',
        createdAt: now,
        updatedAt: now,
      },
    ]);

    await queryInterface.bulkInsert('tags_places', [
      { id: 15, tag_id: 2, place_id: 16, createdAt: now, updatedAt: now },
      { id: 16, tag_id: 12, place_id: 17, createdAt: now, updatedAt: now },
      { id: 17, tag_id: 10, place_id: 18, createdAt: now, updatedAt: now },
      { id: 18, tag_id: 1, place_id: 19, createdAt: now, updatedAt: now },
      { id: 19, tag_id: 10, place_id: 20, createdAt: now, updatedAt: now },
      { id: 20, tag_id: 14, place_id: 21, createdAt: now, updatedAt: now },
      { id: 21, tag_id: 1, place_id: 22, createdAt: now, updatedAt: now },
      { id: 22, tag_id: 13, place_id: 23, createdAt: now, updatedAt: now },
      { id: 23, tag_id: 6, place_id: 24, createdAt: now, updatedAt: now },
      { id: 24, tag_id: 12, place_id: 25, createdAt: now, updatedAt: now },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('tags_places', {
      id: [15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
    });

    await queryInterface.bulkDelete('places', {
      id: [16, 17, 18, 19, 20, 21, 22, 23, 24, 25],
    });
  },
};
