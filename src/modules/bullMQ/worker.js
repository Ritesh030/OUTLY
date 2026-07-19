const { Worker } = require('bullmq')
const { connection } = require('./queues')
const MatchesRepository = require('../matches/matches.repository')
const { setPointsTableInRedis } = require('../../utils/redis/redisPointsTable')
const TournamentRepository = require('../tournament/tournament.repository')
const { sendMail } = require('../../config/email.config')
const { sendStatusMail } = require('../notification/notification.email')
const UserRepository = require('../user/user.repository')
const { EMAIL_ID } = require('../../config/server.config')

const matchesRepository = new MatchesRepository()
const tournamentRepository = new TournamentRepository()
const userRepository = new UserRepository()

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

// worker for sending mails
const mailWorker = new Worker("mail",
      async (job) => {
            const tournamentId = job.data.tournamentId
            const newStatus = job.data.newStatus

            const mailSubject = "Your tournament status is updated"
            const mailBody = `Tournament status updated to ${newStatus}`

            const tournamentTeams = await tournamentRepository.getTeams(tournamentId)

            for (const t of tournamentTeams) {
                  const owner = await userRepository.getById(t.Team.ownerId)
                  await sendStatusMail(EMAIL_ID, owner.email, mailSubject, mailBody)
            }
      },
      { connection }
)

mailWorker.on("completed", (job) => {
      console.log(`Mails sent for tournamentId: ${job.data.tournamentId}`)
})

mailWorker.on('failed', (job, error) => {
      console.error(`Failed to send mails for tournamentId: ${job?.data?.tournamentId}`, error)
})
module.exports = {
      standingsWorker,
      mailWorker
}