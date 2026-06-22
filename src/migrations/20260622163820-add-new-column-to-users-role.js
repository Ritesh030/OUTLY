'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'role', {
      type: Sequelize.ENUM('PLAYER', 'ORGANIZER', 'ADMIN'),
      defaultValue: 'PLAYER',
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'yourNewColumnName');
  }
};