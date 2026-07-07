'use strict';
const bcrypt = require('bcrypt');

module.exports = {
    async up(queryInterface, Sequelize) {

        // 1. Hash password once
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        // 2. Create 13 brand new players (21-33, no overlap with Team A's players 1-20)
        const playersData = [];
        for (let i = 21; i <= 33; i++) {
            playersData.push({
                name: `Player ${i}`,
                email: `player${i}@tournamentapp.com`,
                password: hashedPassword,
                cityId: null,
                role: 'USER',
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        const createdUsers = await queryInterface.bulkInsert('Users', playersData, { returning: true });

        // 3. Create Team Beta with first new player as owner
        const [teamId] = await queryInterface.bulkInsert('Teams', [{
            name: 'Beta Squad Esport',
            ownerId: createdUsers[0].id,
            createdAt: new Date(),
            updatedAt: new Date()
        }], { returning: ['id'] });

        const targetTeamId = typeof teamId === 'object' ? teamId.id : teamId;

        // 4. Add all 13 players to Team Beta
        const userTeamJunctionRows = createdUsers.map((player, index) => ({
            teamId: targetTeamId,
            userId: player.id,
            role: index === 0 ? 'CAPTAIN' : 'PLAYER',
            createdAt: new Date(),
            updatedAt: new Date()
        }));

        await queryInterface.bulkInsert('UserTeams', userTeamJunctionRows);
    },

    async down(queryInterface, Sequelize) {

        // Only delete Beta Squad and its players — won't touch Team A data
        const [team] = await queryInterface.sequelize.query(
            `SELECT id FROM "Teams" WHERE name = 'Beta Squad Esport' LIMIT 1`,
            { type: Sequelize.QueryTypes.SELECT }
        );

        if (team) {
            await queryInterface.sequelize.query(
                `DELETE FROM "UserTeams" WHERE "teamId" = ${team.id}`
            );
            await queryInterface.sequelize.query(
                `DELETE FROM "Teams" WHERE id = ${team.id}`
            );
        }

        await queryInterface.bulkDelete('Users', {
            email: Array.from({ length: 13 }, (_, i) => `player${i + 21}@tournamentapp.com`)
        }, {});
    }
};