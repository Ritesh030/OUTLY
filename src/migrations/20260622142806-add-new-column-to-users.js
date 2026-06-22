'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'refreshToken', {
      type: Sequelize.STRING,
      allowNull: true // Or false with a defaultValue
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'yourNewColumnName');
  }
};