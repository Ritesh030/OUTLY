'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('MatchResults', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      matchId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      winnerTeamId: {
        type: Sequelize.INTEGER
      },
      teamARuns: {
        type: Sequelize.INTEGER
      },
      teamAOvers: {
        type: Sequelize.INTEGER
      },
      teamAWickets: {
        type: Sequelize.INTEGER
      },
      teamBRuns: {
        type: Sequelize.INTEGER
      },
      teamBOvers: {
        type: Sequelize.INTEGER
      },
      teamBWickets: {
        type: Sequelize.INTEGER
      },
      resultType: {
        type: Sequelize.ENUM('WIN', 'TIE', 'NO_RESULT'),
        allowNull: false
      },
      note: {
        type: Sequelize.TEXT
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
    await queryInterface.dropTable('MatchResults');
  }
};