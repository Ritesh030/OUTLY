const { StatusCodes } = require("http-status-codes");

const CrudService = require("../crud/curd.service");
const TournamentRepository = require("../tournament/tournament.repository");
const MatchesRepository = require("./matches.repository");
const TeamRepository = require("../team/team.repository");
const { buildAppError, AppError } = require("../../utils");
const { isValidStatusTransitionForMatch } = require("../../utils/stateMachine");
const { incrementTeamScore, decrementTeamScore } = require('../../utils/redis/redisLeaderboard');
const { executeInTransaction } = require("../../utils/transactionHelper");
const db = require("../../models");

class MatchesService extends CrudService {
      constructor() {
            const repository = new MatchesRepository
            super(repository)
            this.repository = repository
            this.tournamentRepository = new TournamentRepository()
            this.teamRepository = new TeamRepository()
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

                  if (tournament.status != 'REGISTRATION-CLOSED') {
                        throw new AppError("status mismatch", "fixtures can only be created when the registration is closed and the tournament is not onGoing", " ", StatusCodes.NOT_IMPLEMENTED)
                  }

                  const existingFixtures = await this.repository.getFixturesCount(tournamentId)
                  if (existingFixtures > 0) {
                        throw new AppError("Fixtures Already Generated", " ", "Fixtures for this tournament have already been generated.", StatusCodes.CONFLICT)
                  }

                  const createdMatches = await this.repository.generateFixtures(tournamentId)

                  return createdMatches
            } catch (error) {
                  if (error instanceof AppError) throw error
                  throw buildAppError(error, { service: 'matches - service', controller: 'generateFixtures' })
            }
      }

      async recreateFixtures({ tournamentId, userId }) {
            try {
                  const tournament = await this.tournamentRepository.getById(tournamentId)
                  if (!tournament) {
                        throw new AppError("Not Found", " ", "Tournament does not exist.", StatusCodes.NOT_FOUND)
                  }

                  if (userId !== tournament.organizerId) {
                        throw new AppError("Unauthorized", " ", "Only the organizer can recreate fixtures.", StatusCodes.UNAUTHORIZED)
                  }

                  if (tournament.status !== 'REGISTRATION-CLOSED') {
                        throw new AppError(
                              "Invalid Status", " ",
                              "Fixtures can only be recreated when tournament is in REGISTRATION-CLOSED status.",
                              StatusCodes.BAD_REQUEST
                        )
                  }

                  // Check no match has started or completed
                  const activeMatches = await this.repository.getActiveMatchesCount(tournamentId)
                  if (activeMatches > 0) {
                        throw new AppError(
                              "Matches In Progress", " ",
                              "Cannot recreate fixtures — some matches are already ongoing or completed.",
                              StatusCodes.BAD_REQUEST
                        )
                  }

                  return await this.repository.recreateFixtures(tournamentId)

            } catch (error) {
                  if (error instanceof AppError) throw error
                  throw buildAppError(error, { service: 'matches - service', controller: 'recreateFixtures' })
            }
      }

      async createMatchResult({ userId, data }) {
            try {
                  const VALID_RESULT_TYPES = ['WIN', 'TIE', 'NO_RESULT'] 

                  if (!data.resultType || !VALID_RESULT_TYPES.includes(data.resultType)) {
                        throw new AppError("Invalid resultType", " ", `resultType must be one of: ${VALID_RESULT_TYPES.join(', ')}`, StatusCodes.BAD_REQUEST)
                  }

                  const match = await this.repository.getById(data.matchId)
                  if (!match) {
                        throw new AppError("Not Found", " ", "Match with this id does not exist.", StatusCodes.NOT_FOUND)
                  }

                  if (match.status !== 'COMPLETED') {
                        throw new AppError("Match Not Completed", " ", "Result cannot be created since the match is not completed.", StatusCodes.BAD_REQUEST)
                  }

                  // check if the winnerTeamId is correct
                  if (match.teamAId != data.winnerTeamId && match.teamBId != data.winnerTeamId) {
                        throw new AppError("Incorect winnerId", "the winner should be one from playing teams", "Result cannot be created since the winnerId is incorrect.", StatusCodes.BAD_REQUEST)
                  }

                  const tournament = await this.tournamentRepository.getById(match.tournamentId)
                  if (!tournament) {
                        throw new AppError("Not Found", " ", "Tournament with this id does not exist.", StatusCodes.NOT_FOUND)
                  }

                  if (userId !== tournament.organizerId) {
                        throw new AppError("Unauthorized", " ", "Only the organizer can submit match result.", StatusCodes.UNAUTHORIZED)
                  }

                  // 1. Create result and update team totalWins in one transaction
                  const result = await executeInTransaction(db.sequelize, async (transaction) => {
                        const matchResult = await this.repository.createMatchResult(data, transaction)

                        if (data.resultType === 'WIN') {
                              await this.teamRepository.incrementWins(data.winnerTeamId, transaction)
                        }

                        return matchResult
                  })

                  // 2. Redis leaderboard — eventual consistency, fire and forget
                  if (data.resultType === 'WIN') {
                        incrementTeamScore(data.winnerTeamId)
                  }

                  return result

            } catch (error) {
                  if (error instanceof AppError) throw error
                  throw buildAppError(error, { service: 'matches - service', controller: 'createMatchResult' })
            }
      }

      async updateMatchResult({ userId, matchId, data }) {
            try {
                  const VALID_RESULT_TYPES = ['WIN', 'TIE', 'NO_RESULT'] 

                  if (!data.resultType || !VALID_RESULT_TYPES.includes(data.resultType)) {
                        throw new AppError("Invalid resultType", " ", `resultType must be one of: ${VALID_RESULT_TYPES.join(', ')}`, StatusCodes.BAD_REQUEST)
                  }

                  const match = await this.repository.getById(matchId)
                  if (!match) {
                        throw new AppError("Not Found", " ", "Match with this id does not exist.", StatusCodes.NOT_FOUND)
                  }

                  // check if the winnerTeamId is correct
                  if (match.teamAId != data.winnerTeamId && match.teamBId != data.winnerTeamId) {
                        throw new AppError("Incorect winnerId", "the winner should be one from playing teams", "Result cannot be created since the winnerId is incorrect.", StatusCodes.BAD_REQUEST)
                  }

                  const tournament = await this.tournamentRepository.getById(match.tournamentId)
                  if (!tournament) {
                        throw new AppError("Not Found", " ", "Tournament with this id does not exist.", StatusCodes.NOT_FOUND)
                  }

                  if (userId !== tournament.organizerId) {
                        throw new AppError("Unauthorized", " ", "Only the organizer can update match result.", StatusCodes.UNAUTHORIZED)
                  }

                  // 1. Update result and adjust totalWins in one transaction
                  const { matchResult, previousWinnerId, previousResultType } = await executeInTransaction(db.sequelize, async (transaction) => {
                        const updateResult = await this.repository.updateMatchResult(matchId, data, transaction)

                        const previousWasWin = updateResult.previousResultType === 'WIN' && updateResult.previousWinnerId
                        const newIsWin = data.resultType === 'WIN' && data.winnerTeamId

                        if (previousWasWin) {
                              await this.teamRepository.decrementWins(updateResult.previousWinnerId, transaction)
                        }

                        if (newIsWin) {
                              await this.teamRepository.incrementWins(data.winnerTeamId, transaction)
                        }

                        return updateResult
                  })

                  // 2. Redis leaderboard — eventual consistency, fire and forget
                  const previousWasWin = previousResultType === 'WIN' && previousWinnerId
                  const newIsWin = data.resultType === 'WIN' && data.winnerTeamId

                  if (previousWasWin) {
                        decrementTeamScore(previousWinnerId)
                  }

                  if (newIsWin) {
                        incrementTeamScore(data.winnerTeamId)
                  }

                  return matchResult

            } catch (error) {
                  if (error instanceof AppError) throw error
                  throw buildAppError(error, { service: 'matches - service', controller: 'updateMatchResult' })
            }
      }

      async changeMatchStatus({ userId, matchId, newStatus }) {
            try {
                  const match = await this.repository.getById(matchId)
                  if (!match) {
                        throw new AppError("Not Found", " ", "match with this id does not exist.", StatusCodes.NOT_FOUND)
                  }

                  isValidStatusTransitionForMatch(match.status, newStatus)

                  const tournament = await this.tournamentRepository.getById(match.tournamentId)
                  if (!tournament) {
                        throw new AppError("Not Found", " ", "Tournament with this id does not exist.", StatusCodes.NOT_FOUND)
                  }

                  if (userId !== tournament.organizerId) {
                        throw new AppError("UNAUTHORIZED USER", "Only ORGANIZER can submit match result", "", StatusCodes.UNAUTHORIZED)
                  }

                  const result = await this.repository.changeMatchStatus(match, newStatus)

                  return result
            } catch (error) {
                  if (error instanceof AppError) throw error
                  throw buildAppError(error, { service: 'matches - service', controller: 'changeMatchStatus' })
            }
      }

      async getPointsTable(tournamentId) {
            try {
                  const result = await this.repository.getPointsTable(tournamentId)
                  return result
            } catch (error) {
                  if (error instanceof AppError) throw error
                  throw buildAppError(error, { service: 'matches - service', controller: 'getPointsTable' })
            }
      }

      async getCompletedMatches(tournamentId) {
            try {
                  const result = await this.repository.getCompletedMatches(tournamentId)
                  return result
            } catch (error) {
                  if (error instanceof AppError) throw error
                  throw buildAppError(error, { service: 'matches - service', controller: 'getCompletedMatches' })
            }
      }
}

module.exports = MatchesService