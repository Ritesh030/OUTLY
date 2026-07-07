'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Matches', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      tournametId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      roundNumber: {
        type: Sequelize.INTEGER
      },
      teamAId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      teamBId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      scheduledAt: {
        type: Sequelize.DATE
      },
      venue: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.ENUM('SCHEDULED', 'ONGOING', 'COMPLETED', 'ABANDONED', 'POSTPONED'),
        defaultValue: 'SCHEDULED'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Matches');
  }
};