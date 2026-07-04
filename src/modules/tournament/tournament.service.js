const { AppError, buildAppError } = require("../../utils");
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
}

module.exports = TournamentService