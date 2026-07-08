'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.renameColumn('MatchResults', 'teamAOvers', 'teamABalls')
    await queryInterface.renameColumn('MatchResults', 'teamBOvers', 'teamBBalls')
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
