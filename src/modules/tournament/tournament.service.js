const { AppError, buildAppError } = require("../../utils");
const { isValidStatusTransition } = require("../../utils/tournamentStatus");
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
            const tournament = await this.repository.getById(tournamentId)

            isValidStatusTransition(tournament.status, newStatus)

            tournament.status = newStatus

            await tournament.save()

            return await this.repository.getTournament(tournamentId)
      }
}

module.exports = TournamentService