const cron = require('node-cron')
const TournamentRepository = require('../../tournament/tournament.repository')
const MatchesRepository = require('../../matches/matches.repository')
const { setPointsTableInRedis } = require('../../../utils/redis/redisPointsTable')

const tournamentRepository = new TournamentRepository()
const matchesRepository = new MatchesRepository()

const syncStandings = () => {
      cron.schedule('0 0 * * *', async () => {
            console.log('⏰ Syncing standings for all ongoing tournaments')

            const ongoingTournaments = await tournamentRepository.getOngoingTournament()

            for (const t of ongoingTournaments) {
                  try {
                        const result = await matchesRepository.getPointsTable(t.id)
                        await setPointsTableInRedis(t.id, result)
                        console.log(`✅ Standings synced for tournamentId: ${t.id}`)
                  } catch (error) {
                        console.error(`❌ Failed to sync standings for tournamentId: ${t.id}`, error)
                  }
            }
      }, {
            timezone: 'Asia/Kolkata' 
      })
}

module.exports = { syncStandings }