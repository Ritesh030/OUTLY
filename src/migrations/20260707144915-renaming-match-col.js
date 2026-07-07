'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.renameColumn('Matches', 'tournametId', 'tournamentId');
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.renameColumn('Matches', 'tournamentId', 'tournametId');
    }
};