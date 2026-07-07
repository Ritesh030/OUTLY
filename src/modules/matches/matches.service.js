const CrudService = require("../crud/curd.service");
const TournamentRepository = require("../tournament/tournament.repository");
const MatchesRepository = require("./matches.repository");
const { buildAppError, AppError } = require("../../utils");
const { StatusCodes } = require("http-status-codes");

class MatchesService extends CrudService {
      constructor() {
            const repository = new MatchesRepository
            super(repository)
            this.repository = repository
            const tournamentRepository = new TournamentRepository()
            this.tournamentRepository = tournamentRepository
      }

      async generateFixtures({ tournamentId, userId }) {
            try {
                  const tournament = await this.tournamentRepository.getById(tournamentId)
                  if (!tournament) {
                        throw new AppError("Not Found", " ", "Tournament with this id does not exist.", StatusCodes.NOT_FOUND)
                  }

                  if (userId !== tournament.organizerId) {
                        throw new AppError("UNAUTHORIZED USER", "Only ORGANIZER can generate fixtures", "", StatusCodes.UNAUTHORIZED)
                  }

                  if (tournament.formate != 'ROUND-ROBIN') {
                        throw new AppError("Formate mismatch", "fixtures for this formate cannot be created automatically for now", " ", StatusCodes.NOT_IMPLEMENTED)
                  }

                  const createdMatches = await this.repository.generateFixtures(tournamentId)

                  return createdMatches
            } catch (error) {
                  if (error instanceof AppError) throw error
                  throw buildAppError(error, { service: 'matches - service', controller: 'generateFixtures' })
            }
      }
}

module.exports = MatchesService