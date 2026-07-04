'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addIndex('TournamentTeams', ['"tournamentId"', '"teamId"'], {
            unique: true,
            name: 'unique_tournament_team'
        });

        await queryInterface.addIndex('TournamentPlayers', ['"tournamentId"', '"userId"'], {
            unique: true,
            name: 'unique_tournament_player'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeIndex('TournamentTeams', 'unique_tournament_team');
        await queryInterface.removeIndex('TournamentPlayers', 'unique_tournament_player');
    }
};