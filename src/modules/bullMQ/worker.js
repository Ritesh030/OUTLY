const { Worker } = require('bullmq')
const { connection } = require('./queues')
const MatchesRepository = require('../matches/matches.repository')
const { setPointsTableInRedis } = require('../../utils/redis/redisPointsTable')

const matchesRepository = new MatchesRepository()

// worker for standings calculation
const standingsWorker = new Worker("standings",
      async (job) => {
            const tournamentId = job.data.tournamentId
            const result = await matchesRepository.getPointsTable(tournamentId)

            await setPointsTableInRedis(tournamentId, result)
      },
      { connection }
)

standingsWorker.on("completed", (job) => {
      console.log(`A background worker has recalculated the stadings for tournamentId: ${job.data.tournamentId}`)
})

standingsWorker.on("failed", (job, error) => {
      console.log(`failed to process standings for tournamentId: ${job?.data?.tournamentId}`, error)
})

module.exports = {
      standingsWorker
}