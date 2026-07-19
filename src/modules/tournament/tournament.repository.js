const CrudRepository = require("../crud/crud.repository");
const db = require("../../models");
const { executeInTransaction } = require("../../utils/transactionHelper");
const { AppError, buildAppError } = require("../../utils");
const { StatusCodes } = require("http-status-codes");

class TournamentRepository extends CrudRepository {
      constructor() {
            super(db.Tournament)
      }

      async getTeamsCount(tournamentId, transaction = null) {
            try {
                  const count = await db.TournamentTeams.count({
                        where: { tournamentId: tournamentId }, lock: transaction?.LOCK?.UPDATE, transaction
                  })

                  return count
            } catch (error) {
                  if (error instanceof AppError) throw error
                  throw buildAppError(error, { service: 'tournament - repository', controller: 'getTeamsCount' })
            }
      }

      async getTeams(tournamentId) {
            try {
                  return await db.TournamentTeams.findAll({
                        where: { tournamentId },
                        include: [{
                              model: db.Team,
                              as: 'Team',
                              attributes: ['id', 'name', 'ownerId']
                        }]
                  })
            } catch (error) {
                  if (error instanceof AppError) throw error
                  throw buildAppError(error, { service: 'tournament - repository', controller: 'getTeams' })
            }
      }

      async getTournament(tournamentId, transaction = null) {
            try {
                  const tournament = await db.Tournament.findByPk(tournamentId, {
                        attributes: ['id', 'name', 'formate', 'status', 'maxTeams', 'playerPerTeam', 'registrationDeadline', 'startDate', 'location'],

                        include: [{
                              model: db.Team,
                              as: 'teams',
                              attributes: ['id', 'name'],
                              through: { attributes: [] }, // Hides TournamentTeams metadata from JSON output

                              include: [{
                                    model: db.User,
                                    as: 'member',
                                    attributes: ['id', 'name', 'email'],
                                    through: { attributes: ['role'] }
                              }]
                        }], transaction
                  })

                  return tournament
            } catch (error) {
                  if (error instanceof AppError) throw error
                  throw buildAppError(error, { service: 'tournament - repository', controller: 'getTournament' })
            }
      }

      async getOpenTournament() {
            try {
                  const tournament = await db.Tournament.findAll({
                        where: {
                              status: 'OPEN'
                        }
                  })

                  return tournament
            } catch (error) {
                  if (error instanceof AppError) throw error
                  throw buildAppError(error, { service: 'tournament - repository', controller: 'getOpenTournament' })
            }
      }

      async getOngoingTournament() {
            try {
                  const tournament = await db.Tournament.findAll({
                        where: {
                              status: 'ONGOING'
                        }
                  })

                  return tournament
            } catch (error) {
                  if (error instanceof AppError) throw error
                  throw buildAppError(error, { service: 'tournament - repository', controller: 'getOngoingTournamet' })
            }
      }

      async getAll() {
            try {
                  const tournaments = await db.Tournament.findAll({
                        attributes: ['id', 'name', 'organizerId', 'formate', 'status', 'maxTeams', 'playerPerTeam', 'registrationDeadline', 'startDate', 'location'],
                        include: [{
                              model: db.Team,
                              as: 'teams',
                              attributes: ['id', 'name'],
                              through: { attributes: [] },
                              include: [{
                                    model: db.User,
                                    as: 'member',
                                    attributes: ['id', 'name', 'email'],
                                    through: { attributes: ['role'] }
                              }]
                        }]
                  })

                  return tournaments
            } catch (error) {
                  if (error instanceof AppError) throw error
                  throw buildAppError(error, { service: 'tournament - repository', controller: 'getAll' })
            }
      }

      async registerTeam({ tournamentId, teamId }) {
            try {
                  return await executeInTransaction(db.sequelize, async (transaction) => {

                        // 1. Validate tournament exists
                        const tournament = await db.Tournament.findByPk(tournamentId, { lock: transaction.LOCK.UPDATE, transaction })
                        if (!tournament) {
                              throw new AppError("Not Found", " ", "Tournament with this id does not exist.", StatusCodes.NOT_FOUND)
                        }

                        // 2. Check tournament status
                        if (tournament.status !== 'OPEN') {
                              throw new AppError("Registration Not Open", " ", "This tournament is not accepting registrations.", StatusCodes.BAD_REQUEST)
                        }

                        // 3. Check registration deadline
                        if (new Date() > new Date(tournament.registrationDeadline)) {
                              throw new AppError("Deadline Passed", " ", "The registration deadline has passed.", StatusCodes.BAD_REQUEST)
                        }

                        // 4. Check capacity
                        const numberOfRegisteredTeams = await this.getTeamsCount(tournamentId, transaction)
                        if (numberOfRegisteredTeams >= tournament.maxTeams) {
                              throw new AppError("Tournament Full", " ", "Maximum team capacity has been reached.", StatusCodes.BAD_REQUEST)
                        }

                        // 5. Validate team exists
                        const team = await db.Team.findByPk(teamId, { transaction })
                        if (!team) {
                              throw new AppError("Not Found", " ", "Team with this id does not exist.", StatusCodes.NOT_FOUND)
                        }

                        // 6. Check duplicate registration
                        const alreadyRegistered = await db.TournamentTeams.findOne({
                              where: { tournamentId, teamId }, transaction
                        })
                        if (alreadyRegistered) {
                              throw new AppError("Already Registered", " ", "This team is already registered.", StatusCodes.BAD_REQUEST)
                        }

                        // 7. Validate player count
                        const playersInTeam = await team.getMember({ transaction })
                        if (playersInTeam.length !== tournament.playerPerTeam) {
                              throw new AppError(
                                    "Team Size Mismatch", " ",
                                    `Team must have exactly ${tournament.playerPerTeam} players to register.`,
                                    StatusCodes.BAD_REQUEST
                              )
                        }

                        // 8. Check if any player is already registered via a different team
                        const playerIds = playersInTeam.map(p => p.id)
                        const alreadyRegisteredPlayers = await db.TournamentPlayers.findAll({
                              where: { tournamentId: tournament.id, userId: playerIds },
                              transaction
                        })
                        if (alreadyRegisteredPlayers.length > 0) {
                              const conflictingIds = alreadyRegisteredPlayers.map(p => p.userId)
                              throw new AppError(
                                    "Player Already Registered", " ",
                                    `Players with ids [${conflictingIds.join(', ')}] are already registered in this tournament via another team.`,
                                    StatusCodes.CONFLICT
                              )
                        }

                        // 9. Register team and players
                        await tournament.addTeams(team, { transaction })
                        await Promise.all(
                              playersInTeam.map(player =>
                                    db.TournamentPlayers.create({
                                          tournamentId: tournament.id,
                                          teamId: team.id,
                                          userId: player.id
                                    }, { transaction })
                              )
                        )

                        return await this.getTournament(tournamentId, transaction)
                  })
            } catch (error) {
                  if (error instanceof AppError) throw error
                  throw buildAppError(error, { service: 'tournament - repository', controller: 'registerTeam' })
            }
      }
}

module.exports = TournamentRepository