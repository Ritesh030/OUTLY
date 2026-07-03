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
        type: Sequelize.ENUM('OPEN', 'REGISTRATION-CLOSED', 'ONGOING', 'COMPLETED', 'CANCELLED'),
        defaultValue: 'OPEN'
      },
      maxTeams: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      registrationDeadline: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("NOW() + INTERVAL '5 days'")
      },
      startDate: {
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

    await queryInterface.addConstraint('Tournaments', {
      type: 'check',
      fields: ['maxTeams'],
      where: {
        maxTeams: {
          [Sequelize.Op.gte]: 2
        }
      },
      name: "Tournaments minimum number of teams"
    })
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Tournaments');
  }
};