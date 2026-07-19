const cron = require('node-cron')
const TournamentRepository = require('../../tournament/tournament.repository')
const TournamentService = require('../../tournament/tournament.service')
const { AppError, buildAppError } = require('../../../utils')

const tournamentRepository = new TournamentRepository()
const tournamentService = new TournamentService

const statusChangeJob = () => {
      cron.schedule('*/20 * * * *', async () => {
            console.log("Running job to check for tournament state transition")

            try {
                  const openTournament = await tournamentRepository.getOpenTournament()

                  for (const t of openTournament) {
                        if (new Date(t.registrationDeadline) <= new Date()) {
                              await tournamentService.updateStatus({ tournamentId: t.id, newStatus: 'REGISTRATION-CLOSED' })
                        }
                  }
            } catch (error) {
                  console.error('Status change job failed:', error)
            }
      })
}

module.exports = {
      statusChangeJob
}