'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('Matches', {
      fields: ['tournamentId'],
      type: 'foreign key',
      name: 'matches_tournamentId_fk',
      references: {
        table: 'Tournaments', // Exact name of target table in DB
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('Matches', 'matches_tournamentId_fk');
  }
};