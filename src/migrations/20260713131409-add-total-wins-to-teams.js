'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // 1. Add the column with correct capitalization
    await queryInterface.addColumn('Teams', 'totalWins', {
      type: Sequelize.INTEGER,
      allowNull: false, // Prevents null rows from bypassing your calculation logic
      defaultValue: 0
    });

    // 2. Add the index to speed up the leaderboard sorting
    await queryInterface.addIndex('Teams', ['totalWins'], {
      name: 'teams_total_wins_idx'
    });

    // 3. Add the check constraint using a clean SQL string expression
    await queryInterface.addConstraint('Teams', {
      type: 'check',
      fields: ['totalWins'],
      where: {
        totalWins: queryInterface.sequelize.literal('"totalWins" >= 0')
      },
      name: 'teams_total_wins_min_zero_chk' 
    });
  },

  async down (queryInterface, Sequelize) {
    // Rollback must happen in the exact reverse order of creation!
    
    // 1. Drop the check constraint by its name
    await queryInterface.removeConstraint('Teams', 'teams_total_wins_min_zero_chk');

    // 2. Drop the index
    await queryInterface.removeIndex('Teams', 'teams_total_wins_idx');

    // 3. Finally, drop the column safely
    await queryInterface.removeColumn('Teams', 'totalWins');
  }
};