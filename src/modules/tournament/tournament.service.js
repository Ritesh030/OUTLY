const { AppError, buildAppError } = require("../../utils");
const { isValidStatusTransition } = require("../../utils/stateMachine");
const { mailQueue } = require("../bullMQ/queues");
const CrudService = require("../crud/curd.service");
const TournamentRepository = require("./tournament.repository");

class TournamentService extends CrudService {
      constructor() {
            const repository = new TournamentRepository()
            super(repository)
            this.repository = repository
      }

      async registerTeam({ tournamentId, teamId }) {
            try {
                  const tournament = await this.repository.registerTeam({ tournamentId, teamId })
                  return tournament
            } catch (error) {
                  if (error instanceof AppError) throw error
                  throw buildAppError(error, { service: 'tournament - service', controller: 'registerTeam' })
            }
      }

      async updateStatus({ tournamentId, newStatus }) {
            try {
                  const tournament = await this.repository.getById(tournamentId)

                  isValidStatusTransition(tournament.status, newStatus)

                  tournament.status = newStatus

                  await tournament.save()

                  // adding job for sending mail
                  mailQueue.add("Sending mails for tournament status update",
                        {
                              tournamentId: tournamentId,
                              newStatus: newStatus
                        },
                        {
                              attempts: 3,
                              backoff: {
                                    type: "exponential",
                                    delay: 1000
                              }
                        }
                  ).catch(err =>
                        console.error('Failed to queue email service for tournament status update:', err)
                  )

                  return await this.repository.getTournament(tournamentId)
            } catch (error) {
                  if (error instanceof AppError) throw error
                  throw buildAppError(error, { service: 'tournament - service', controller: 'registerTeam' })
            }
      }
}

module.exports = TournamentService