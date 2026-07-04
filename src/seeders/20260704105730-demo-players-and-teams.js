'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Generate a universally safe, identical pre-hashed password string for all seed users
    // (This saves your CPU from running bcrypt 20 separate times during the seed migration)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const playersData = [];
    
    // 2. Dynamically build a pool of 20 players
    for (let i = 1; i <= 20; i++) {
      playersData.push({
        name: `Player ${i}`,
        email: `player${i}@tournamentapp.com`,
        password: hashedPassword,
        cityId: null, // Left null or change to an existing city ID if required
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // 3. Bulk insert the players and get back their generated IDs
    const createdUsers = await queryInterface.bulkInsert('Users', playersData, { returning: true });

    // 4. Create a demo squad table row so we have a target team to assign players to
    // (We assign the first created user as the structural owner of the team)
    const [teamId] = await queryInterface.bulkInsert('Teams', [{
      name: 'Alpha Squad Esport',
      ownerId: createdUsers[0].id,
      createdAt: new Date(),
      updatedAt: new Date()
    }], { returning: ['id'] });

    // Extract the actual ID number from the database result row array
    const targetTeamId = typeof teamId === 'object' ? teamId.id : teamId;

    // 5. Take exactly 13 players from our newly generated pool and map them to the team
    const initialSquadToRegister = createdUsers.slice(0, 13);
    const userTeamJunctionRows = [];

    initialSquadToRegister.forEach((player, index) => {
      userTeamJunctionRows.push({
        teamId: targetTeamId,
        userId: player.id,
        // Make the very first player the squad CAPTAIN, and the rest normal PLAYERS
        role: index === 0 ? 'CAPTAIN' : 'PLAYER',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    // 6. Push the roster records directly into your UserTeam junction table footprint
    await queryInterface.bulkInsert('UserTeams', userTeamJunctionRows);
  },

  async down(queryInterface, Sequelize) {
    // Graceful rollback: Clear out the changes cleanly if you revert the seed execution
    await queryInterface.bulkDelete('UserTeams', null, {});
    await queryInterface.bulkDelete('Teams', null, {});
    await queryInterface.bulkDelete('Users', null, {});
  }
};