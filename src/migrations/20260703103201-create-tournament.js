'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Tournaments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      organizerId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      formate: {
        type: Sequelize.ENUM('ROUND-ROBIN', 'KNOCKOUT', 'GROUP-STAGE'),
        defaultValue: 'ROUND-ROBIN'
      },
      status: {
        type: Sequelize.ENUM('DRAFT', 'OPEN', 'REGISTRATION-CLOSED', 'ONGOING', 'COMPLETED', 'CANCELLED'),
        defaultValue: 'DRAFT'
      },
      max_teams: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      registrationDeadline: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("NOW() + INTERVAL '5 days'")
      },
      statDate: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("NOW() + INTERVAL '6 days'")
      },
      location: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('Tournaments');
  }
};