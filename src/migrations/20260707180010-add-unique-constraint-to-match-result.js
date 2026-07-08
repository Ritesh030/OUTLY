'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('MatchResults', {
      fields: ['matchId'],
      type: 'unique',
      name: 'match_results_matchId_unique_idx'
    });
  },

  async down(queryInterface, SQLize) {
    await queryInterface.removeConstraint('MatchResults', 'match_results_matchId_unique_idx');
  }
};