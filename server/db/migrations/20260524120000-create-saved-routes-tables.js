'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('saved_routes', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      distance_km: {
        type: Sequelize.NUMERIC,
        allowNull: false,
      },
      duration_minutes: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      route_geometry: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      start_place_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'places',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.createTable('saved_route_places', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      saved_route_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'saved_routes',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      place_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'places',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      order_index: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      leg_duration_minutes: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      leg_distance_km: {
        type: Sequelize.NUMERIC,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.addIndex('saved_routes', ['user_id']);
    await queryInterface.addIndex('saved_route_places', ['saved_route_id']);
    await queryInterface.addConstraint('saved_route_places', {
      fields: ['saved_route_id', 'place_id'],
      type: 'unique',
      name: 'saved_route_places_saved_route_id_place_id_unique',
    });
    await queryInterface.addConstraint('saved_route_places', {
      fields: ['saved_route_id', 'order_index'],
      type: 'unique',
      name: 'saved_route_places_saved_route_id_order_index_unique',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('saved_route_places');
    await queryInterface.dropTable('saved_routes');
  },
};
